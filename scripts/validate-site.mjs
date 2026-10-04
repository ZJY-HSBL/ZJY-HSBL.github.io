import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root=process.cwd();
const toPosix=p=>p.split(path.sep).join("/");
const skip=new Set([".git","node_modules"]);

function walk(dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...walk(full));
    else out.push(toPosix(path.relative(root,full)));
  }
  return out;
}

const files=walk(root);
const fileSet=new Set(files);
const htmlFiles=files.filter(f=>f.endsWith(".html"));
const jsFiles=files.filter(f=>f.endsWith(".js")&&!f.startsWith("scripts/"));
const html=new Map(htmlFiles.map(f=>[f,fs.readFileSync(path.join(root,f),"utf8")]));
const errors=[];

function resolveLocal(page,ref){
  if(/^(?:[a-z]+:|\/\/)/i.test(ref))return null;
  const [rawPath,hash=""]=ref.split("#");
  const clean=(rawPath||"").split("?")[0];
  let target;
  if(!clean)target=page;
  else if(clean.startsWith("/"))target=clean.slice(1);
  else target=toPosix(path.normalize(path.join(path.dirname(page),clean)));
  if(!target)target="index.html";
  if(clean.endsWith("/"))target=target.replace(/\/$/,"")+"/index.html";
  return {target,hash:decodeURIComponent(hash)};
}

for(const file of jsFiles){
  const source=fs.readFileSync(path.join(root,file),"utf8");
  try{new vm.Script(source,{filename:file});}
  catch(err){errors.push(`${file}: JavaScript syntax error: ${err.message}`);}
}

for(const [page,source] of html){
  const ids=[...source.matchAll(/\sid=["']([^"']+)["']/g)].map(m=>m[1]);
  const seen=new Set();
  for(const id of ids){
    if(seen.has(id))errors.push(`${page}: duplicate id #${id}`);
    seen.add(id);
  }
  if(!/<main\b/i.test(source))errors.push(`${page}: missing <main>`);
  if(!/<title>[^<]+<\/title>/i.test(source))errors.push(`${page}: missing <title>`);
  if(page!=="404.html"){
    if(!/<meta\s+name=["']description["']/i.test(source))errors.push(`${page}: missing meta description`);
    if(!/<link\s+rel=["']canonical["']/i.test(source))errors.push(`${page}: missing canonical URL`);
  }

  for(const match of source.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)){
    const ref=match[1];
    if(ref.startsWith("mailto:")||ref.startsWith("tel:")||ref.startsWith("data:")||ref.startsWith("javascript:"))continue;
    const resolved=resolveLocal(page,ref);
    if(!resolved)continue;
    if(!fileSet.has(resolved.target)){
      errors.push(`${page}: missing local target "${ref}" -> ${resolved.target}`);
      continue;
    }
    if(resolved.hash&&resolved.target.endsWith(".html")){
      const targetSource=html.get(resolved.target)||"";
      const escaped=resolved.hash.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      if(!new RegExp(`\\sid=["']${escaped}["']`).test(targetSource)){
        errors.push(`${page}: missing anchor "${ref}"`);
      }
    }
  }
}

if(errors.length){
  console.error(`Site validation failed with ${errors.length} issue(s):\n`);
  for(const error of errors)console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Site validation passed: ${htmlFiles.length} HTML pages, ${jsFiles.length} JavaScript files, ${files.length} files checked.`);
