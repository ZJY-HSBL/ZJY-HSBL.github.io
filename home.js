(() => {
  const menu=document.getElementById("menuButton");
  const nav=document.getElementById("mainNav");
  menu?.addEventListener("click",()=>{
    const open=nav?.classList.toggle("open");
    menu.setAttribute("aria-expanded",open?"true":"false");
  });
  nav?.addEventListener("click",e=>{
    if(e.target.closest("a")){nav.classList.remove("open");menu?.setAttribute("aria-expanded","false")}
  });

  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!reduced && "IntersectionObserver" in window){
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add("visible");obs.unobserve(entry.target)}
      })
    },{threshold:.08,rootMargin:"0px 0px -20px"});
    document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
  }else{
    document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));
  }

  const catalog=window.PORTFOLIO_PROJECTS||[];
  const grid=document.getElementById("projectGrid");
  const filters=document.getElementById("projectFilters");
  const status=document.getElementById("syncStatus");
  const categories=["All",...new Set(catalog.map(x=>x.category))];
  let active="All";
  const repos={};
  const clean=s=>(s||"").split(" · ")[0].trim();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const render=()=>{
    if(!grid)return;
    const rows=catalog.filter(x=>active==="All"||x.category===active);
    grid.innerHTML=rows.map((x,n)=>{
      const r=repos[x.name]||{};
      const href=esc(x.detail||("https://github.com/ZJY-HSBL/"+encodeURIComponent(x.name)));
      const external=!x.detail;
      const lang=esc(r.language||x.tech.split(" · ")[0]);
      const desc=esc(clean(r.description)||x.fallback);
      const meta=Number.isSafeInteger(r.stargazers_count)&&r.stargazers_count>0?("★ "+r.stargazers_count):(x.detail?"Case study":"Repository");
      return '<a class="project-card '+(x.featured?"featured ":"")+'reveal visible" href="'+href+'" '+(external?'target="_blank" rel="noreferrer"':'')+'>'+
        '<div class="project-top"><span>'+String(n+1).padStart(2,"0")+' · '+esc(x.category)+(x.featured?" · Selected":"")+'</span><span>'+lang+'</span></div>'+
        '<div><h3>'+esc(x.name)+'</h3><p>'+desc+'</p><div class="project-tech">'+esc(x.tech)+'</div></div>'+
        '<div class="project-foot"><span>'+esc(meta)+'</span><b>↗</b></div></a>';
    }).join("");
  };

  if(filters){
    filters.innerHTML=categories.map((x,i)=>'<button class="filter '+(i===0?"active":"")+'" data-filter="'+esc(x)+'">'+esc(x)+'</button>').join("");
    filters.addEventListener("click",e=>{
      const b=e.target.closest("button");
      if(!b)return;
      active=b.dataset.filter;
      filters.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));
      render();
    });
  }
  render();

  const cacheKey="zjy-project-cache-v2";
  let cached=null;
  try{cached=JSON.parse(localStorage.getItem(cacheKey)||"null")}catch{}
  if(cached&&Date.now()-cached.time<30*60*1000&&Array.isArray(cached.data)){
    cached.data.filter(Boolean).forEach(r=>repos[r.name]=r);
    render();
    if(status)status.textContent="GitHub data · cached";
  }else{
    Promise.all(catalog.map(x=>fetch("https://api.github.com/repos/ZJY-HSBL/"+x.name)
      .then(r=>r.ok?r.json():null).catch(()=>null)))
      .then(data=>{
        const valid=data.filter(Boolean);
        valid.forEach(r=>repos[r.name]=r);
        render();
        if(valid.length){
          try{localStorage.setItem(cacheKey,JSON.stringify({time:Date.now(),data:valid}))}catch{}
          if(status)status.textContent="GitHub data · synced";
        }else if(status)status.textContent="Static project index";
      })
      .catch(()=>{if(status)status.textContent="Static project index"});
  }
})();