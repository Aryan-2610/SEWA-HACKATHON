"use strict";
// ================= DATA (Kedarnath corridor; coordinates approximate) =================
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=Math.random,pick1=a=>a[Math.floor(R()*a.length)];
const hv=(a,b)=>{const r=x=>x*Math.PI/180,dl=r(b[0]-a[0]),dn=r(b[1]-a[1]);const h=Math.sin(dl/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const P=[["Sonprayag",30.628,78.975,"uplink","4G tower"],["Gaurikund",30.6523,79.0236,"uplink","4G + police Wi-Fi"],["Jungle Chatti",30.668,79.034,"point"],["Bhimbali",30.684,79.045,"point"],["Linchauli",30.708,79.06,"uplink","VSAT relay"],["Rambara",30.6967,79.0522,"point"],["Kedarnath",30.7352,79.0669,"uplink","VSAT + Wi-Fi"]];
const places=P.map(p=>({id:p[0],lat:p[1],lon:p[2],type:p[3],note:p[4]||""}));
const fac=[["Gaurikund PHC","medical",30.6525,79.0231],["Kedarnath Medical Post","medical",30.7345,79.0675],["Rambara First-Aid","medical",30.6965,79.0525],["Gaurikund Shelter","shelter",30.652,79.024],["Linchauli Shelter","shelter",30.7085,79.0605],["Kedarnath Shelter","shelter",30.7358,79.0662],["Kedarnath Helipad","helipad",30.7325,79.0645],["Phata Helipad","helipad",30.642,79.005]].map(f=>({id:f[0],type:f[1],lat:f[2],lon:f[3]}));
const hazards=[{id:"Landslide zone L1",lat:30.689,lon:79.047,type:"hazard",r:350},{id:"Stream crossing S2",lat:30.702,lon:79.056,type:"hazard",r:200},{id:"Rockfall R3",lat:30.661,lon:79.029,type:"hazard",r:280}];
const teams=[{id:"SDRF-Alpha",org:"SDRF",lat:30.6523,lon:79.0236,st:"Available",n:6,skill:"Medical"},{id:"NDRF-Bravo",org:"NDRF",lat:30.7352,lon:79.0669,st:"Available",n:10,skill:"Heli/Rope"},{id:"Mule-Rescue-C",org:"Mule operators",lat:30.6967,lon:79.0522,st:"Available",n:4,skill:"Stretcher"},{id:"SDRF-Delta",org:"SDRF",lat:30.628,lon:78.975,st:"Available",n:6,skill:"Search"},{id:"Police-Echo",org:"Police",lat:30.708,lon:79.06,st:"Available",n:5,skill:"Search"}];
teams.forEach(t=>{t.lastSeen=Date.now();t.home=[t.lat,t.lon]});
const nodes=[...places.map(p=>({...p,kind:"place"})),...fac.map(f=>({...f,kind:"fac"})),...hazards.map(h=>({...h,kind:"haz"})),...teams.map(t=>({id:t.id,lat:t.lat,lon:t.lon,type:"team",kind:"team"}))];
const edges=[];for(let i=0;i<places.length-1;i++)edges.push([places[i].id,places[i+1].id,"TRAIL",hv([places[i].lat,places[i].lon],[places[i+1].lat,places[i+1].lon])*1.4]);
const near=n=>places.reduce((b,p)=>hv([n.lat,n.lon],[p.lat,p.lon])<hv([n.lat,n.lon],[b.lat,b.lon])?p:b);
[...fac,...hazards,...teams].forEach(n=>edges.push([n.id,near(n).id,n.type==="hazard"?"NEAR":"AT",0.05]));
const COL={place:"#7aa7ff",uplink:"#22c3a6",medical:"#ff5d6c",shelter:"#f5a524",helipad:"#a77bff",hazard:"#f5c84b",team:"#3ddc97",sos:"#ff3b4e"};
const colOf=n=>n.kind==="place"?(n.type==="uplink"?COL.uplink:COL.place):COL[n.type];
// ================= ICONS =================
const IP={sos:'<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.01"/>',map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',kg:'<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="m8 7 8 1m-5 9-4-9m7 9 5-8"/>',teams:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6m1-12a3 3 0 0 1 0 6m3 6c0-2.5-1.5-4.5-4-5.5"/>',guide:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm3 12h11"/>',audit:'<path d="M6 3h9l4 4v14H6V3Zm3 9h7m-7 4h7M9 8h3"/>',
Medical:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M3.5 12h5l1.5-3 2 6 1.5-3h7"/>',Lost:'<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',Injury:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',Trapped:'<path d="m8 3 4 8 5-5 5 15H2L8 3Z"/>',Weather:'<path d="M17.5 17H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 0 1 0 9Z"/><path d="m13 13-3 4h4l-3 4"/>',
users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',radio:'<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2"/><circle cx="12" cy="12" r="2"/>',pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',vol:'<path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',mute:'<path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6m0-6 6 6"/>',
dl:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
medical:'<path d="M12 6v12M6 12h12"/>',shelter:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-6h6v6"/>',helipad:'<path d="M8 6v12M16 6v12M8 12h8"/>',uplink:'<path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/>',hazard:'<path d="M12 3 2 20h20L12 3Zm0 6v5m0 3v.01"/>',team:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',route:'<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>'};
const ic=(k,c="ic")=>`<svg class="${c}" viewBox="0 0 24 24" aria-hidden="true">${IP[k]||""}</svg>`;
// ================= STATE =================
const SEV={Trapped:"crit",Medical:"crit",Injury:"high",Lost:"med",Weather:"med"},SEVN={crit:"Critical",high:"High",med:"Moderate"},SEVR={crit:0,high:1,med:2};
const FLOW=["NEW","ACK","ASSIGNED","ENROUTE","ONSCENE","RESOLVED"],FLOWL={NEW:"New",ACK:"Acknowledged",ASSIGNED:"Assigned",ENROUTE:"En route",ONSCENE:"On scene",RESOLVED:"Resolved",FALSE_ALARM:"False alarm"};
const SKILL={Medical:"Medical",Injury:"Stretcher",Trapped:"Heli/Rope",Lost:"Search",Weather:"Heli/Rope"};
const names=["A. Sharma","R. Negi","P. Rawat","S. Iyer","M. Khan","D. Bisht","K. Joshi","L. Das","V. Thapa","N. Rao"],types=["Medical","Lost","Injury","Trapped","Weather"];
const phones=["Samsung SM-A356E","Redmi 12","Pixel 7a","OnePlus Nord CE","Vivo Y200","Realme 11"];
let sos=[],audit=[],seq=1040,sel=null,filt="ACTIVE",qtext="",sound=true;
const tstr=t=>new Date(t).toLocaleTimeString([], {hour12:false});
const ago=ms=>{const s=Math.max(0,Math.floor(ms/1000));return s<60?s+"s":s<3600?Math.floor(s/60)+"m "+String(s%60).padStart(2,"0")+"s":Math.floor(s/3600)+"h "+Math.floor(s%3600/60)+"m"};
const hexId=()=>[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,"0")).join("");
function log(id,ev,by="system",kind="system"){audit.unshift({ts:Date.now(),id,ev,by,kind});if(sel===id)drawDetail();drawAudit()}
function newSOS(back=0){const base=pick1(places),id="SOS-"+(++seq),hops=1+Math.floor(R()*5),up=places.filter(p=>p.type==="uplink");
 const lat=base.lat+(R()-.5)*.012,lon=base.lon+(R()-.5)*.012,gw=up.reduce((b,p)=>hv([lat,lon],[p.lat,p.lon])<hv([lat,lon],[b.lat,b.lon])?p:b),type=pick1(types);
 const ts=Date.now()-back,sig=R()<.94?"VALID":"UNKNOWN KEY";
 const s={id,mid:hexId(),name:pick1(names),type,sev:SEV[type],people:1+Math.floor(R()*4),lat,lon,hops,phone:pick1(phones),sender:hexId().slice(0,8),st:"NEW",team:null,sig,ts,via:gw.id,area:near({lat,lon}).id,uploads:R()<.35?2+Math.floor(R()*3):1,notes:[]};
 sos.unshift(s);audit.unshift({ts,id,ev:`Packet uploaded via ${s.via} gateway after ${hops} hops · Ed25519 ${sig}`,by:s.phone,kind:"created_upload"});
 if(s.uploads>1)audit.unshift({ts:ts+4000,id,ev:`Duplicate relay merged (${s.uploads} uploads, same messageId)`,by:"dedupe",kind:"relay_upload"});
 if(sos.length>24)sos.pop();return s}
// ================= SHELL =================
const tabs=[["live","Live SOS","sos","Real-time incident queue"],["map","Operations map","map","Corridor situational awareness"],["kg","Knowledge graph","kg","Routes, facilities and hazards"],["teams","Teams","teams","Field unit status"],["guide","Playbook","guide","Standard operating procedure"],["audit","Audit trail","audit","Append-only event log"]];
$("#nav").innerHTML=tabs.map((t,i)=>`<button data-t="${t[0]}">${ic(t[2])}${t[1]}${t[0]==="live"?'<span class="badge" id="nb"></span>':""}<kbd>${i+1}</kbd></button>`).join("");
$$("nav button").forEach(b=>b.onclick=()=>show(b.dataset.t));
$("#sic").innerHTML=ic("search");$("#aic").innerHTML=ic("search");$("#csv").innerHTML=ic("dl")+"Export CSV";$("#bell").innerHTML=ic("bell");
function show(t){const T=tabs.find(x=>x[0]===t);$$("section").forEach(s=>s.classList.toggle("on",s.id===t));$$("nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));
 $("#crumb").textContent=T[1];$("#subt").textContent=T[3];$("#main").style.overflow=t==="map"?"hidden":"auto";
 if(t==="map"){initMap();setTimeout(()=>{map.invalidateSize();drawMap()},60)}if(t==="kg")drawKG()}
let theme="dark";try{theme=localStorage.getItem("seva-theme")||"dark"}catch(e){}
function setTheme(t){theme=t;document.documentElement.dataset.theme=t;$("#theme").innerHTML=ic(t==="dark"?"sun":"moon");try{localStorage.setItem("seva-theme",t)}catch(e){}if(map)setBase(baseName);if($("#kg").classList.contains("on"))drawKG()}
$("#theme").onclick=()=>setTheme(theme==="dark"?"light":"dark");
const setSnd=()=>{$("#snd").innerHTML=ic(sound?"vol":"mute");$("#snd").classList.toggle("on",sound)};$("#snd").onclick=()=>{sound=!sound;setSnd()};setSnd();
$("#bell").onclick=()=>{if("Notification"in window)Notification.requestPermission().then(p=>$("#bell").classList.toggle("on",p==="granted"))};
let actx;function beep(){if(!sound)return;try{actx=actx||new AudioContext();[0,.18].forEach(d=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=880;o.type="sine";g.gain.setValueAtTime(.0001,actx.currentTime+d);g.gain.exponentialRampToValueAtTime(.15,actx.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d+.15);o.connect(g).connect(actx.destination);o.start(actx.currentTime+d);o.stop(actx.currentTime+d+.16)})}catch(e){}}
function toast(s){const d=document.createElement("div");d.className="toast sev-"+s.sev;d.innerHTML=`<div class="tico">${ic(s.type)}</div><div><b>New SOS · ${s.type}</b><small>${s.id} · ${s.people} people near ${s.area}</small></div>`;d.onclick=()=>{show("live");selectSOS(s.id);d.remove()};$("#toasts").prepend(d);setTimeout(()=>d.remove(),7000);
 if("Notification"in window&&Notification.permission==="granted")try{new Notification(`SOS ${s.type} · ${s.area}`,{body:`${s.id} · ${s.people} people · ${s.hops} hops`})}catch(e){}}
// ================= LIVE =================
const active=s=>!["RESOLVED","FALSE_ALARM"].includes(s.st);
const FILTERS=[["ACTIVE","Active",active],["NEW","Unacked",s=>s.st==="NEW"],["PROG","In progress",s=>["ACK","ASSIGNED","ENROUTE","ONSCENE"].includes(s.st)],["CLOSED","Closed",s=>!active(s)],["ALL","All",()=>true]];
$("#qs").oninput=e=>{qtext=e.target.value.toLowerCase();drawList()};
function visible(){const f=FILTERS.find(x=>x[0]===filt)[2];return sos.filter(f).filter(s=>!qtext||`${s.id} ${s.type} ${s.area} ${s.name} ${s.st}`.toLowerCase().includes(qtext)).sort((a,b)=>(active(b)-active(a))||(a.st==="NEW"?0:1)-(b.st==="NEW"?0:1)||SEVR[a.sev]-SEVR[b.sev]||a.ts-b.ts)}
function median(a){if(!a.length)return null;a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]}
function drawStats(){const act=sos.filter(active),nw=sos.filter(s=>s.st==="NEW"),acks=sos.filter(s=>s.ackTs).map(s=>s.ackTs-s.ts),free=teams.filter(t=>t.st==="Available").length,ppl=act.reduce((n,s)=>n+s.people,0);
 const m=median(acks),K=[["Active incidents",act.length,"var(--acc)",`${ppl} people affected`,"sos"],["Unacknowledged",nw.length,"var(--crit)",nw.some(s=>Date.now()-s.ts>120000)?"SLA breach (> 2 min)":"within 2 min SLA","clock"],["Critical",act.filter(s=>s.sev==="crit").length,"var(--high)","Trapped / medical","Medical"],["In progress",sos.filter(s=>["ASSIGNED","ENROUTE","ONSCENE"].includes(s.st)).length,"var(--info)","teams deployed","route"],["Median time to ack",m==null?"—":ago(m),"var(--vio)",`${acks.length} acknowledged`,"clock"],["Teams available",`${free}/${teams.length}`,"var(--ok)","ready to dispatch","teams"]];
 $("#stats").innerHTML=K.map(k=>`<div class="kpi" style="--k:${k[2]}"><span>${ic(k[4])}${k[0]}</span><b>${k[1]}</b><em>${k[3]}</em></div>`).join("");
 $("#nb").textContent=nw.length||"";$("#nb").style.display=nw.length?"":"none"}
function drawList(){const v=visible();$("#qcount").textContent=`${v.length} shown · ${sos.length} total`;
 $("#fseg").innerHTML=FILTERS.map(f=>`<button class="${f[0]===filt?"on":""}" data-f="${f[0]}">${f[1]}<i>${sos.filter(f[2]).length}</i></button>`).join("");
 $$("#fseg button").forEach(b=>b.onclick=()=>{filt=b.dataset.f;drawList()});
 $("#list").innerHTML=v.length?v.map(s=>`<div class="inc sev-${s.sev} ${s.id===sel?"sel":""} ${s.fresh?"new":""} ${active(s)?"":"res"}" role="option" aria-selected="${s.id===sel}" onclick="selectSOS('${s.id}')">
  <div class="bar"></div><div class="tico">${ic(s.type)}</div>
  <div><div class="l1">${s.type}<span class="mono">${s.id}</span>${s.uploads>1?`<span class="merge">×${s.uploads} merged</span>`:""}</div>
  <div class="l2"><span>${ic("pin")}${s.area}</span><span>${ic("users")}${s.people}</span><span>${ic("radio")}${s.hops} hops</span>${s.team?`<span>${ic("team")}${s.team}</span>`:""}</div></div>
  <div class="rt"><span class="pill ${s.st}">${FLOWL[s.st]}</span><span class="age ${s.st==="NEW"&&Date.now()-s.ts>120000?"sla":""}" data-ts="${s.ts}">${ago(Date.now()-s.ts)}</span><span class="sevtag">${SEVN[s.sev]}</span></div></div>`).join(""):`<div class="empty">No incidents match this view.</div>`}
function draw(){drawStats();drawList();drawTeams();if(map)drawMap()}
window.selectSOS=id=>{sel=id;sos.forEach(s=>s.fresh=false);drawList();drawDetail()};
const eta=(t,s)=>Math.round(hv([t.lat,t.lon],[s.lat,s.lon])*1.4/3.5*60);
const hm=m=>m<60?m+" min":Math.floor(m/60)+" h "+(m%60)+" m";
function suggest(s){return teams.filter(t=>t.st==="Available").map(t=>({t,e:eta(t,s),m:t.skill===SKILL[s.type]})).sort((a,b)=>(a.e-(a.m?20:0))-(b.e-(b.m?20:0)))}
let mini,miniL;
function drawDetail(){const s=sos.find(x=>x.id===sel);if(!s){$("#dhead").innerHTML=`<div class="empty">Select an incident</div>`;return}
 const nm=k=>{const f=(k==="uplink"?places.filter(p=>p.type==="uplink"):fac.filter(f=>f.type===k)).map(f=>({f,d:hv([s.lat,s.lon],[f.lat,f.lon])})).sort((a,b)=>a.d-b.d)[0];return{f:f.f,km:f.d*1.4}};
 const si=FLOW.indexOf(s.st),nxt=FLOW[si+1],sg=suggest(s);
 $("#dhead").innerHTML=`<div class="dh sev-${s.sev}"><div class="t"><div class="tico">${ic(s.type)}</div><div><h2>${s.type} · ${s.people} ${s.people>1?"people":"person"}</h2><div class="s"><span class="mono">${s.id}</span> · near ${s.area} · received ${tstr(s.ts)} (<span class="age" data-ts="${s.ts}">${ago(Date.now()-s.ts)}</span> ago)</div></div></div><div style="text-align:right"><span class="pill ${s.st}">${FLOWL[s.st]}</span><div class="sevtag" style="margin-top:6px">${SEVN[s.sev]} severity</div></div></div>`;
 initMini(s);
 $("#dbody").innerHTML=`<div class="steps">${FLOW.map((f,i)=>`<div class="${s.st==="FALSE_ALARM"?"":i<=si?"done":""} ${i===si?"cur":""}">${FLOWL[f]}</div>`).join("")}</div>
 <div class="acts">${s.st==="NEW"?`<button class="btn pri" onclick="act('${s.id}','ACK')">${ic("shield")}Acknowledge <kbd>A</kbd></button>`:""}
  ${s.st==="ACK"&&sg[0]?`<button class="btn pri" onclick="act('${s.id}','ASSIGN','${sg[0].t.id}')">${ic("route")}Dispatch ${sg[0].t.id} <kbd>D</kbd></button>`:""}
  ${["ASSIGNED","ENROUTE","ONSCENE"].includes(s.st)?`<button class="btn pri" onclick="act('${s.id}','NEXT')">Mark ${FLOWL[nxt].toLowerCase()} <kbd>N</kbd></button>`:""}
  ${active(s)?`<button class="btn warn" onclick="act('${s.id}','FALSE')">False alarm</button>`:`<button class="btn" onclick="act('${s.id}','REOPEN')">Reopen</button>`}
  <button class="btn" onclick="navigator.clipboard&&navigator.clipboard.writeText('${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}')">${ic("pin")}Copy coordinates</button></div>
 <div class="facts"><div><small>Reporter</small><b>${s.name}</b></div><div><small>Device</small><b>${s.phone}</b></div><div><small>Signature</small><b class="sig ${s.sig==="VALID"?"":"bad"}">${ic("shield")} ${s.sig}</b></div>
  <div><small>Coordinates</small><b class="mono">${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}</b></div><div><small>Relay</small><b>${s.hops} hops → ${s.via}</b></div><div><small>Uploads</small><b>${s.uploads} ${s.uploads>1?"(deduped)":""}</b></div>
  <div><small>Message ID</small><b class="mono">${s.mid}</b></div><div><small>Sender ID</small><b class="mono">${s.sender}</b></div><div><small>Assigned team</small><b>${s.team||"—"}</b></div></div>
 <h4>Nearest facilities · trail distance & walking time</h4><div class="near">${[["medical","Medical"],["uplink","Uplink"],["helipad","Helipad"]].map(([k,l])=>{const n=nm(k);return`<div><small>${ic(k)}${l}</small><b>${n.f.id}</b><span>${n.km.toFixed(1)} km · ${hm(Math.round(n.km/3.5*60))}</span></div>`}).join("")}</div>
 ${active(s)&&!s.team?`<h4>Dispatch · ranked by ETA and skill match</h4><div class="teamsel">${sg.length?sg.map((x,i)=>`<div class="trow ${i===0?"best":""}"><div><b>${x.t.id}${i===0?'<span class="rec">RECOMMENDED</span>':""}</b><small>${x.t.org} · ${x.t.skill}${x.m?" · skill match":""} · ${x.t.n} members</small></div><span class="mono">ETA ${hm(x.e)}</span><span class="mono">${(hv([x.t.lat,x.t.lon],[s.lat,s.lon])*1.4).toFixed(1)} km</span><button class="btn ${i===0?"pri":""}" onclick="act('${s.id}','ASSIGN','${x.t.id}')">Assign</button></div>`).join(""):`<div class="empty">No teams available. All units deployed.</div>`}</div>`:""}
 <h4>Notes</h4><form class="note" onsubmit="event.preventDefault();addNote('${s.id}',this.n.value);this.n.value=''"><input name="n" placeholder="Add an operational note…" aria-label="Note"><button class="btn">Add</button></form>
 <h4>Timeline</h4><div class="tl">${audit.filter(a=>a.id===s.id).map(a=>`<div class="${a.kind==="admin"?"adm":""}"><small>${tstr(a.ts)} · ${a.by}</small>${a.ev}</div>`).join("")}</div>`}
function initMini(s){if(!mini){mini=L.map("mini",{zoomControl:false,attributionControl:false,dragging:true,scrollWheelZoom:false});L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:18}).addTo(mini);miniL=L.layerGroup().addTo(mini)}
 miniL.clearLayers();L.polyline(places.map(p=>[p.lat,p.lon]),{color:"#fff",weight:2,opacity:.7,dashArray:"4 6"}).addTo(miniL);
 L.marker([s.lat,s.lon],{icon:sosIcon(s)}).addTo(miniL);if(s.team){const t=teams.find(x=>x.id===s.team);L.marker([t.lat,t.lon],{icon:fIcon("team")}).addTo(miniL);L.polyline([[t.lat,t.lon],[s.lat,s.lon]],{color:"#3ddc97",weight:3,className:"route"}).addTo(miniL)}
 mini.setView([s.lat,s.lon],14);setTimeout(()=>mini.invalidateSize(),30)}
window.act=(id,a,t)=>{const s=sos.find(x=>x.id===id);if(!s)return;
 if(a==="ACK"){s.st="ACK";s.ackTs=Date.now();log(id,`Acknowledged (${ago(s.ackTs-s.ts)} after receipt)`,"Duty Supervisor","admin")}
 if(a==="ASSIGN"){if(s.st==="NEW"){s.ackTs=Date.now();log(id,"Acknowledged","Duty Supervisor","admin")}const T=teams.find(x=>x.id===t);s.st="ASSIGNED";s.team=t;T.st="Deployed";T.task=id;log(id,`Assigned ${t} · ETA ${hm(eta(T,s))}`,"Duty Supervisor","admin")}
 if(a==="NEXT"){s.st=FLOW[FLOW.indexOf(s.st)+1];log(id,`Status → ${FLOWL[s.st]}`,s.team||"Duty Supervisor","admin");if(s.st==="RESOLVED")freeTeam(s)}
 if(a==="FALSE"){if(!confirm(`Mark ${id} as a false alarm? This closes the incident.`))return;s.st="FALSE_ALARM";freeTeam(s);log(id,"Closed as false alarm","Duty Supervisor","admin")}
 if(a==="REOPEN"){s.st="ACK";log(id,"Incident reopened","Duty Supervisor","admin")}
 draw();drawDetail()};
function freeTeam(s){if(!s.team)return;const T=teams.find(x=>x.id===s.team);T.st="Available";T.task=null;T.lat=T.home[0];T.lon=T.home[1]}
window.addNote=(id,v)=>{v=v.trim();if(!v)return;log(id,"Note: "+v.replace(/[<>&]/g,""),"Duty Supervisor","admin")};
// ================= TEAMS =================
function drawTeams(){$("#tt").innerHTML=teams.map(t=>{const s=t.task&&sos.find(x=>x.id===t.task);return`<div class="card tc"><div class="hd"><div><div class="org">${t.org.toUpperCase()}</div><h2>${t.id}</h2></div><span class="pill ${t.st}">${t.st}</span></div>
 <dl><dt>Capability</dt><dd>${t.skill}</dd><dt>Strength</dt><dd>${t.n} members</dd><dt>Position</dt><dd>${near(t).id}</dd><dt>Tasking</dt><dd>${s?`${s.id} · ${FLOWL[s.st]}`:"—"}</dd><dt>Last check-in</dt><dd class="mono" data-ts="${t.lastSeen}">${tstr(t.lastSeen)}</dd></dl>
 <div class="bar2"><i style="width:${s?(FLOW.indexOf(s.st)/5*100):0}%"></i></div></div>`}).join("")}
// ================= AUDIT =================
let afilt="";$("#as").oninput=e=>{afilt=e.target.value.toLowerCase();drawAudit()};
function drawAudit(){const r=audit.filter(a=>!afilt||`${a.id} ${a.ev} ${a.by} ${a.kind}`.toLowerCase().includes(afilt)).slice(0,300);
 $("#at").innerHTML="<tr><th>Time</th><th>Incident</th><th>Type</th><th>Event</th><th>Actor</th></tr>"+r.map(a=>`<tr><td class="mono">${tstr(a.ts)}</td><td class="mono">${a.id}</td><td><span class="etag ${a.kind==="admin"?"admin":""}">${a.kind}</span></td><td>${a.ev}</td><td>${a.by}</td></tr>`).join("")}
$("#csv").onclick=()=>{const q=v=>`"${String(v).replace(/"/g,'""')}"`,csv="time,incident,type,event,actor\n"+audit.map(a=>[new Date(a.ts).toISOString(),a.id,a.kind,a.ev,a.by].map(q).join(",")).join("\n");
 const u=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),l=document.createElement("a");l.href=u;l.download=`seva-audit-${new Date().toISOString().slice(0,10)}.csv`;l.click();URL.revokeObjectURL(u)};
// ================= MAP =================
let map,baseName="Satellite",baseL,labelL;const LG={};
const BASES={Satellite:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",Terrain:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",Streets:null};
const fIcon=k=>L.divIcon({className:"",iconSize:[26,26],iconAnchor:[13,13],html:`<div class="mk" style="background:${COL[k]}">${ic(k)}</div>`});
const sosIcon=s=>L.divIcon({className:"",iconSize:[34,34],iconAnchor:[17,17],html:`<div class="mk-sos sev-${s.sev}">${s.st==="NEW"?'<span class="pulse"></span>':""}<div class="core">${ic(s.type)}</div></div>`});
function setBase(n){baseName=n;if(baseL)map.removeLayer(baseL);if(labelL)map.removeLayer(labelL);
 const url=BASES[n]||`https://{s}.basemaps.cartocdn.com/${theme==="dark"?"dark_all":"light_all"}/{z}/{x}/{y}{r}.png`;
 baseL=L.tileLayer(url,{maxZoom:18,attribution:n==="Satellite"?"Imagery © Esri":n==="Terrain"?"© OpenTopoMap · © OpenStreetMap":"© OpenStreetMap © CARTO"}).addTo(map);baseL.bringToBack();
 if(n==="Satellite")labelL=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:18,opacity:.85}).addTo(map);
 $$(".bases button").forEach(b=>b.classList.toggle("on",b.textContent===n))}
const LAY=[["sos","Active SOS",COL.sos,"sos"],["team","Rescue teams",COL.team,"team"],["route","Trail & routes","#ffffff","route"],["uplink","Uplinks",COL.uplink,"uplink"],["medical","Medical",COL.medical,"medical"],["shelter","Shelters",COL.shelter,"shelter"],["helipad","Helipads",COL.helipad,"helipad"],["hazard","Hazard zones",COL.hazard,"hazard"]];
function initMap(){if(map)return;map=L.map("mapbox",{zoomControl:false}).setView([30.69,79.03],13);L.control.zoom({position:"topright"}).addTo(map);L.control.scale({position:"bottomright",metric:true,imperial:false}).addTo(map);
 LAY.forEach(l=>LG[l[0]]=L.layerGroup().addTo(map));
 $("#mlegend").innerHTML=`<div class="bases">${Object.keys(BASES).map(b=>`<button>${b}</button>`).join("")}</div>`+LAY.map(l=>`<label><input type="checkbox" checked data-l="${l[0]}"><span class="sw" style="background:${l[2]};${l[0]==="route"?"color:#111":""}">${ic(l[3])}</span>${l[1]}</label>`).join("");
 $$(".bases button").forEach(b=>b.onclick=()=>setBase(b.textContent));
 $$("#mlegend input").forEach(c=>c.onchange=()=>c.checked?map.addLayer(LG[c.dataset.l]):map.removeLayer(LG[c.dataset.l]));
 map.on("mousemove",e=>$("#mcoord").textContent=`${e.latlng.lat.toFixed(5)}°N  ${e.latlng.lng.toFixed(5)}°E  · z${map.getZoom()}`);
 setBase(baseName);drawStatic()}
function drawStatic(){const g=LG;
 const tr=places.map(p=>[p.lat,p.lon]);L.polyline(tr,{color:"#000",weight:7,opacity:.35}).addTo(g.route);L.polyline(tr,{color:"#fff",weight:3,opacity:.9,dashArray:"1 7",lineCap:"round"}).addTo(g.route);
 places.forEach(p=>{const m=L.marker([p.lat,p.lon],{icon:p.type==="uplink"?fIcon("uplink"):L.divIcon({className:"",iconSize:[12,12],html:'<div class="mk place"></div>'})}).bindTooltip(p.id,{permanent:true,direction:"right",offset:[12,0],className:"mk-lbl"}).bindPopup(`<b>${p.id}</b><br>${p.type==="uplink"?"Uplink · "+p.note:"Trail waypoint"}<br><span class="mono">${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}</span>`);m.addTo(p.type==="uplink"?g.uplink:g.route)});
 fac.forEach(f=>L.marker([f.lat,f.lon],{icon:fIcon(f.type)}).bindPopup(`<b>${f.id}</b><br>${f.type[0].toUpperCase()+f.type.slice(1)} · near ${near(f).id}`).addTo(g[f.type]));
 hazards.forEach(h=>{L.circle([h.lat,h.lon],{radius:h.r,color:COL.hazard,weight:2,dashArray:"5 5",fillColor:COL.hazard,fillOpacity:.18}).bindPopup(`<b>${h.id}</b><br>Hazard radius ≈ ${h.r} m · avoid / escort only`).addTo(g.hazard);L.marker([h.lat,h.lon],{icon:fIcon("hazard")}).addTo(g.hazard)})}
function drawMap(){if(!map)return;LG.sos.clearLayers();LG.team.clearLayers();
 teams.forEach(t=>L.marker([t.lat,t.lon],{icon:fIcon("team"),zIndexOffset:500}).bindPopup(`<b>${t.id}</b><br>${t.org} · ${t.skill} · ${t.n} members<br>Status: ${t.st}${t.task?" → "+t.task:""}`).addTo(LG.team));
 const act=sos.filter(active);
 act.forEach(s=>{L.marker([s.lat,s.lon],{icon:sosIcon(s),zIndexOffset:1000}).bindPopup(`<b>${s.id} · ${s.type}</b><br>${s.people} people · ${SEVN[s.sev]} · ${FLOWL[s.st]}<br>Near ${s.area} · ${s.hops} hops via ${s.via}<br><a href="#" onclick="show('live');selectSOS('${s.id}');return false">Open incident →</a>`).addTo(LG.sos);
  if(s.team){const t=teams.find(x=>x.id===s.team);L.polyline([[t.lat,t.lon],[s.lat,s.lon]],{color:"#3ddc97",weight:3,className:"route"}).bindTooltip(`${t.id} → ${s.id} · ETA ${hm(eta(t,s))}`).addTo(LG.team)}});
 $("#mpanel").innerHTML=`<div class="ph"><h3>Situation</h3><div class="mk3"><div><b>${act.length}</b><small>Active</small></div><div><b style="color:var(--crit)">${act.filter(s=>s.st==="NEW").length}</b><small>Unacked</small></div><div><b style="color:var(--ok)">${teams.filter(t=>t.st==="Available").length}</b><small>Teams free</small></div></div></div>`+
 (act.length?visible().filter(active).map(s=>`<div class="mi sev-${s.sev}" onclick="map.flyTo([${s.lat},${s.lon}],15)"><div class="tico">${ic(s.type)}</div><div><b>${s.type}</b> <span class="mono" style="color:var(--mut)">${s.id}</span><small>${s.area} · ${s.people} ppl · <span class="age" data-ts="${s.ts}">${ago(Date.now()-s.ts)}</span></small></div><span class="pill ${s.st}">${FLOWL[s.st]}</span></div>`).join(""):`<div class="empty">No active incidents</div>`)}
// ================= KNOWLEDGE GRAPH =================
let pos={},hl=new Set(),hle=new Set();const W=760,H=520;
nodes.forEach((n,i)=>pos[n.id]={x:W/2+Math.cos(i)*200*R(),y:H/2+Math.sin(i)*200*R(),vx:0,vy:0});
(function layout(){for(let k=0;k<300;k++){nodes.forEach(a=>nodes.forEach(b=>{if(a===b)return;const p=pos[a.id],q=pos[b.id];let dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;const f=2400/(d*d);p.vx+=dx/d*f;p.vy+=dy/d*f}));
 edges.forEach(e=>{const p=pos[e[0]],q=pos[e[1]];let dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;const f=(d-(e[2]==="TRAIL"?85:48))*.02;p.vx+=dx/d*f;p.vy+=dy/d*f;q.vx-=dx/d*f;q.vy-=dy/d*f});
 nodes.forEach(n=>{const p=pos[n.id];p.vx+=(W/2-p.x)*.003;p.vy+=(H/2-p.y)*.003;p.x+=p.vx*.5;p.y+=p.vy*.5;p.vx*=.8;p.vy*=.8})}})();
function drawKG(){const c=$("#cv"),dpr=devicePixelRatio||1,cw=c.clientWidth||W;c.width=cw*dpr;c.height=H*dpr;const x=c.getContext("2d"),sc=cw/W;x.setTransform(dpr*sc,0,0,dpr,0,0);
 const cs=getComputedStyle(document.documentElement),tx=cs.getPropertyValue("--tx"),ln=cs.getPropertyValue("--line2"),mu=cs.getPropertyValue("--mut"),ac=cs.getPropertyValue("--acc");x.font="500 11px Inter,sans-serif";
 edges.forEach(e=>{const p=pos[e[0]],q=pos[e[1]],h=hle.has(e[0]+e[1]);x.strokeStyle=h?ac:ln;x.lineWidth=h?3:e[2]==="TRAIL"?1.6:1;x.setLineDash(e[2]==="NEAR"?[4,4]:[]);x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke();
  if(e[2]==="TRAIL"){x.fillStyle=mu;x.fillText(e[3].toFixed(1)+" km",(p.x+q.x)/2+4,(p.y+q.y)/2-4)}});x.setLineDash([]);
 nodes.forEach(n=>{const p=pos[n.id],r=n.kind==="place"?9:6;x.globalAlpha=hl.size&&!hl.has(n.id)?.3:1;if(hl.has(n.id)){x.fillStyle=colOf(n)+"40";x.beginPath();x.arc(p.x,p.y,r+7,0,7);x.fill()}
  x.fillStyle=colOf(n);x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill();x.fillStyle=tx;x.fillText(n.id,p.x+r+4,p.y+4);x.globalAlpha=1})}
$("#legend").innerHTML=Object.entries({"Trail point":COL.place,Uplink:COL.uplink,Medical:COL.medical,Shelter:COL.shelter,Helipad:COL.helipad,Hazard:COL.hazard,Team:COL.team}).map(([k,v])=>`<span><i style="background:${v}"></i>${k}</span>`).join("");
function path(a,b){const d={},pr={},q=new Set(places.map(p=>p.id));places.forEach(p=>d[p.id]=Infinity);d[a]=0;
 while(q.size){let u=[...q].reduce((m,k)=>d[k]<d[m]?k:m);q.delete(u);if(d[u]===Infinity)break;edges.filter(e=>e[2]==="TRAIL"&&(e[0]===u||e[1]===u)).forEach(e=>{const v=e[0]===u?e[1]:e[0];if(d[u]+e[3]<d[v]){d[v]=d[u]+e[3];pr[v]=u}})}
 const r=[b];while(r[0]!==a&&pr[r[0]])r.unshift(pr[r[0]]);return{km:d[b],p:r}}
const hrs=km=>hm(Math.round(km/3.5*60));
function ask(q){q=q.toLowerCase();hl=new Set();hle=new Set();let out="";
 const mention=nodes.find(n=>n.kind==="place"&&q.includes(n.id.toLowerCase()))||nodes.find(n=>q.includes(n.id.toLowerCase())),sm=q.match(/sos-?\s?(\d+)/),s=sm&&sos.find(x=>x.id==="SOS-"+sm[1]);
 const from=s?{id:s.id,lat:s.lat,lon:s.lon}:mention||places[1];const here=near(from);
 const rank=list=>list.map(n=>({n,...path(here.id,near(n).id),d:hv([from.lat,from.lon],[n.lat,n.lon])})).sort((a,b)=>a.km-b.km);
 const say=(label,list)=>{const r=rank(list)[0];if(!r)return"No result.";hl=new Set([...r.p,r.n.id,from.id]);r.p.forEach((v,i)=>{if(r.p[i+1]){hle.add(v+r.p[i+1]);hle.add(r.p[i+1]+v)}});hle.add(r.n.id+near(r.n).id);
  return `QUERY   ${label}\nFROM    ${from.id}\nRESULT  ${r.n.id}\nPATH    ${r.p.join(" → ")}\nTRAIL   ${r.km.toFixed(1)} km  ·  walk ≈ ${hrs(r.km)}\nDIRECT  ${r.d.toFixed(1)} km straight-line`};
 if(/uplink|network|internet|signal|connect/.test(q))out=say("Nearest uplink",places.filter(p=>p.type==="uplink"));
 else if(/medic|doctor|hospital|aid|injur/.test(q))out=say("Nearest medical post",fac.filter(f=>f.type==="medical"));
 else if(/shelter|stay|night/.test(q))out=say("Nearest shelter",fac.filter(f=>f.type==="shelter"));
 else if(/heli|airlift|evac/.test(q))out=say("Nearest helipad",fac.filter(f=>f.type==="helipad"));
 else if(/team|rescue|sdrf|ndrf|reach/.test(q))out=say("Closest available team",teams.filter(t=>t.st==="Available"));
 else if(/hazard|danger|landslide|risk|unsafe/.test(q)){const h=hazards.filter(z=>hv([from.lat,from.lon],[z.lat,z.lon])<6).sort((a,b)=>hv([from.lat,from.lon],[a.lat,a.lon])-hv([from.lat,from.lon],[b.lat,b.lon]));hl=new Set([from.id,...h.map(z=>z.id)]);out=`QUERY   Hazards within 6 km\nFROM    ${from.id}\n`+(h.map(z=>`RESULT  ${z.id.padEnd(22)} ${hv([from.lat,from.lon],[z.lat,z.lon]).toFixed(1)} km`).join("\n")||"RESULT  none")}
 else if(/how many|count|status|summary/.test(q))out=`ACTIVE      ${sos.filter(active).length}\nUNACKED     ${sos.filter(x=>x.st==="NEW").length}\nIN PROGRESS ${sos.filter(x=>["ASSIGNED","ENROUTE","ONSCENE"].includes(x.st)).length}\nTEAMS FREE  ${teams.filter(t=>t.st==="Available").length}/${teams.length}`;
 else out="Supported queries: nearest uplink / medical / shelter / helipad to <place or SOS-ID> · which team can reach <place> · hazards near <place> · status";
 $("#ans").textContent=out;drawKG()}
$("#qf").onsubmit=e=>{e.preventDefault();ask($("#q").value)};
$("#chips").innerHTML=["nearest uplink to Rambara","nearest medical for Linchauli","which team can reach Bhimbali","hazards near Rambara","nearest helipad to Gaurikund","status"].map(c=>`<button>${c}</button>`).join("");
$$("#chips button").forEach(b=>b.onclick=()=>{$("#q").value=b.textContent;ask(b.textContent)});
// ================= PLAYBOOK =================
$("#gd").innerHTML=[["Incident handling SOP","<ol><li><b>Acknowledge within 2 minutes.</b> Unacknowledged incidents turn red after the SLA.</li><li><b>Verify the signature.</b> Treat UNKNOWN KEY as unverified and seek corroboration.</li><li><b>Dispatch</b> the recommended team (ETA + skill match), or override with reason in notes.</li><li><b>Track status</b> en route → on scene → resolved.</li><li><b>Close with a note</b> describing outcome and handover.</li></ol>"],
["How an SOS reaches this room","<ol><li>Phone signs a 90-byte Ed25519 packet.</li><li>Packet hops phone-to-phone over Bluetooth / Wi-Fi (max 10 hops, 24 h TTL).</li><li>The first phone with internet uploads it via the nearest uplink.</li><li>Duplicate uploads are merged by message ID.</li></ol>"],
["Emergency contacts","<ul><li><b>112</b> · National emergency response</li><li>This console supports, and does not replace, official emergency services.</li><li>Add district numbers only after verification.</li></ul>"],
["Severity model","<ul><li><b>Critical</b> · Trapped, Medical</li><li><b>High</b> · Injury</li><li><b>Moderate</b> · Lost, Weather</li><li>Queue order: unacknowledged first, then severity, then age.</li></ul>"],
["Distance & time estimates","<ul><li>Trail distance ≈ straight-line × 1.4</li><li>Walking pace 3.5 km/h (flat fallback; Tobler when elevation is available)</li><li>Coordinates are approximate pending survey verification.</li></ul>"],
["Keyboard","<ul><li><b>1–6</b> switch section · <b>J/K</b> move through queue</li><li><b>A</b> acknowledge · <b>D</b> dispatch · <b>N</b> next status</li><li><b>/</b> search · <b>?</b> shortcuts</li></ul>"]].map(g=>`<div class="card"><h3>${g[0]}</h3>${g[1]}</div>`).join("");
// ================= KEYBOARD =================
document.addEventListener("keydown",e=>{if(/INPUT|TEXTAREA/.test(document.activeElement.tagName)){if(e.key==="Escape")document.activeElement.blur();return}
 if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key.toLowerCase(),v=visible(),i=v.findIndex(s=>s.id===sel),s=sos.find(x=>x.id===sel);
 if(/^[1-6]$/.test(k))show(tabs[+k-1][0]);
 else if(k==="j"&&v.length)selectSOS(v[Math.min(v.length-1,i+1)].id);else if(k==="k"&&v.length)selectSOS(v[Math.max(0,i-1)].id);
 else if(k==="/"){e.preventDefault();show("live");$("#qs").focus()}else if(k==="?")$("#help").showModal();
 else if(s&&k==="a"&&s.st==="NEW")act(s.id,"ACK");else if(s&&k==="d"&&active(s)&&!s.team){const g=suggest(s)[0];if(g)act(s.id,"ASSIGN",g.t.id)}
 else if(s&&k==="n"&&["ASSIGNED","ENROUTE","ONSCENE"].includes(s.st))act(s.id,"NEXT")});
// ================= BOOT =================
[540,410,300,190,95,40,12].forEach(b=>newSOS(b*1000));
(()=>{const a=sos[4];a.st="ASSIGNED";a.ackTs=a.ts+70000;a.team="NDRF-Bravo";const t=teams[1];t.st="Deployed";t.task=a.id;audit.unshift({ts:a.ackTs,id:a.id,ev:"Acknowledged",by:"Duty Supervisor",kind:"admin"},{ts:a.ackTs+30000,id:a.id,ev:"Assigned NDRF-Bravo",by:"Duty Supervisor",kind:"admin"});
 const b=sos[5];b.st="ENROUTE";b.ackTs=b.ts+50000;b.team="SDRF-Alpha";teams[0].st="Deployed";teams[0].task=b.id;audit.unshift({ts:b.ackTs,id:b.id,ev:"Acknowledged",by:"Duty Supervisor",kind:"admin"});
 const c=sos[6];c.st="RESOLVED";c.ackTs=c.ts+95000;audit.sort((x,y)=>y.ts-x.ts)})();
setTheme(theme);sel=visible()[0].id;draw();drawDetail();drawAudit();show("live");
setInterval(()=>{const n=Date.now();$("#clock").textContent=tstr(n);$$(".age[data-ts]").forEach(el=>{const ts=+el.dataset.ts,s=sos.find(x=>x.ts===ts);el.textContent=ago(n-ts);el.classList.toggle("sla",!!s&&s.st==="NEW"&&n-ts>120000&&el.closest(".inc"))})},1000);
setInterval(()=>{const s=newSOS();s.fresh=true;draw();toast(s);beep();if(!sel)selectSOS(s.id)},25000);
setInterval(()=>{teams.forEach(t=>{t.lastSeen=Date.now();const s=t.task&&sos.find(x=>x.id===t.task);if(s&&["ENROUTE","ONSCENE"].includes(s.st)){t.lat+=(s.lat-t.lat)*.15;t.lon+=(s.lon-t.lon)*.15}});drawTeams();if(map)drawMap()},5000);
