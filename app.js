(() => {
 const root=document.documentElement,toggle=document.getElementById("themeToggle"),saved=localStorage.getItem("zjy-theme");
 if(saved==="light"||saved==="dark") root.dataset.theme=saved;
 const sync=()=>{if(!toggle)return;const light=root.dataset.theme==="light";toggle.textContent=light?"●":"○";toggle.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");toggle.setAttribute("aria-pressed",light?"true":"false")};sync();
 toggle?.addEventListener("click",()=>{root.dataset.theme=root.dataset.theme==="light"?"dark":"light";localStorage.setItem("zjy-theme",root.dataset.theme);sync()});
 const progress=document.querySelector(".progress");const scroll=()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h?scrollY/h*100:0)+"%"};addEventListener("scroll",scroll,{passive:true});scroll();
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.1,rootMargin:"0px 0px -30px"});
 const observe=()=>document.querySelectorAll(".reveal:not(.visible)").forEach(e=>observer.observe(e));observe();

 const catalog=window.PORTFOLIO_PROJECTS||[],grid=document.getElementById("projectGrid"),filters=document.getElementById("projectFilters"),status=document.getElementById("syncStatus");
 const categories=["All",...new Set(catalog.map(x=>x.category))];let active="All",repos={};
 const cleanDescription=s=>(s||"").split(" · ")[0].trim();
 // GitHub API responses and localStorage cache entries are data, never trusted markup.
 const escapeHTML=value=>String(value??"").replace(/[&<>"']/g,char=>({
   "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[char]);
 const render=()=>{
   if(!grid)return; const rows=catalog.filter(x=>active==="All"||x.category===active);
   grid.innerHTML=rows.map((x,n)=>{
     const r=repos[x.name]||{};
     // The destination comes from our curated catalog, not external API metadata.
     const href=escapeHTML(x.detail||"https://github.com/ZJY-HSBL/"+encodeURIComponent(x.name));
     const external=!x.detail;
     const language=escapeHTML(r.language||x.tech.split(" · ")[0]);
     const description=escapeHTML(cleanDescription(r.description)||x.fallback);
     const stars=Number.isSafeInteger(r.stargazers_count)&&r.stargazers_count>0?"★ "+r.stargazers_count:(x.detail?"View case study":"GitHub repository");
     return `<a class="project-card reveal ${x.featured?"featured":""}" href="${href}" ${external?'target="_blank" rel="noreferrer"':""}><div class="project-top"><span>0${n+1} / ${escapeHTML(x.category)}${x.featured?" · Case Study":""}</span><span>${language}</span></div><h3>${escapeHTML(x.name)}</h3><p>${description}</p><div class="project-tech">${escapeHTML(x.tech)}</div><div class="project-foot"><span>${stars}</span><b>↗</b></div></a>`;
   }).join("");observe()
 };
 if(filters){filters.innerHTML=categories.map((x,i)=>`<button class="filter ${i===0?"active":""}" data-filter="${escapeHTML(x)}">${escapeHTML(x)}</button>`).join("");filters.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;active=b.dataset.filter;filters.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));render()})}
 render();
 const cacheKey="zjy-project-cache-v1",cacheTTL=30*60*1000;
 let cached=null;try{cached=JSON.parse(localStorage.getItem(cacheKey)||"null")}catch{}
 if(cached&&Date.now()-cached.time<cacheTTL&&Array.isArray(cached.data)){cached.data.filter(Boolean).forEach(r=>repos[r.name]=r);render();if(status)status.textContent=`Cached from GitHub · ${Object.keys(repos).length} projects`}
 else Promise.all(catalog.map(x=>fetch(`https://api.github.com/repos/ZJY-HSBL/${x.name}`).then(r=>r.ok?r.json():null).catch(()=>null))).then(data=>{const valid=data.filter(Boolean);valid.forEach(r=>repos[r.name]=r);render();if(valid.length){try{localStorage.setItem(cacheKey,JSON.stringify({time:Date.now(),data:valid}))}catch{}if(status)status.textContent=`Synced from GitHub · ${valid.length} projects`}else if(status)status.textContent="Static project catalog · GitHub API unavailable"}).catch(()=>{if(status)status.textContent="Static project catalog · GitHub API unavailable"});
 const canvas=document.getElementById("field"),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(canvas&&!reduced){const c=canvas.getContext("2d");let w,h,d=1,t=0;const resize=()=>{d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0)};addEventListener("resize",resize,{passive:true});resize();const wave=(y,a,l,s,o)=>{c.beginPath();for(let x=-20;x<w+20;x+=8){const yy=y+Math.sin((x+t*s+o)/l)*a+Math.sin((x-t*s*.5)/(l*.45))*a*.25;x===-20?c.moveTo(x,yy):c.lineTo(x,yy)}c.strokeStyle=root.dataset.theme==="light"?"rgba(31,127,147,.10)":"rgba(118,200,217,.10)";c.lineWidth=.8;c.stroke()};const draw=()=>{c.clearRect(0,0,w,h);const y=h*.57;wave(y-70,7,150,.4,0);wave(y-25,11,190,.28,100);wave(y+30,15,240,.2,200);t+=.5;requestAnimationFrame(draw)};draw()}
})();