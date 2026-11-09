// Potatinja — Ranking: melhores tempos com TODAS as estrelas, por fase, por mundo e global.
// Login: conta Google (via Supabase). Sem servidor configurado, funciona em modo local (só neste aparelho).
import {RANK_CONFIG} from './potatinja-rank-config.js';
const ONLINE=!!(RANK_CONFIG.supabaseUrl&&RANK_CONFIG.supabaseAnonKey)&&!window.__DEV;
const KEY='potatinja.rank.v1';
const WORLDS=[{n:'Jardim',c:11},{n:'Gelo',c:10},{n:'Lava',c:10},{n:'Nuvens',c:10},{n:'Fortaleza',c:10}];
const TOTAL=WORLDS.reduce((a,w)=>a+w.c,0);
const worldOf=i=>{let k=0;for(let w=0;w<WORLDS.length;w++){if(i<k+WORLDS[w].c)return {w,i:i-k};k+=WORLDS[w].c}return {w:4,i:9}};
const lvId=n=>'l'+n; // n = 1..51
const fmt=ms=>{const s=ms/1000,m=Math.floor(s/60),r=(s-m*60).toFixed(2);return m?`${m}:${r.padStart(5,'0')}`:r+'s'};
const sfx=n=>{try{window.potatinjaSFX?.[n]?.()}catch{}};
const ls={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}}};
let S=Object.assign({nick:'',best:{},session:null},ls.get());
const save=()=>ls.set(S);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------------- Supabase (REST) ----------------
const api={
 h(tok){return {apikey:RANK_CONFIG.supabaseAnonKey,Authorization:'Bearer '+(tok||RANK_CONFIG.supabaseAnonKey),'Content-Type':'application/json'}},
 async req(path,{method='GET',body,tok}={}){let r;try{r=await fetch(RANK_CONFIG.supabaseUrl+path,{method,headers:this.h(tok),body:body?JSON.stringify(body):undefined})}catch{throw new Error('offline')}
  if(!r.ok){let m='';try{m=(await r.json()).message||''}catch{}throw new Error(m||('http '+r.status))}
  const t=await r.text();return t?JSON.parse(t):null},
 googleUrl(){return `${RANK_CONFIG.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(location.origin+location.pathname)}`},
 async token(){const s=S.session;if(!s)return null;if(Date.now()<s.expires_at-60000)return s.access_token;
  try{const r=await this.req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}});setSession(r);return S.session.access_token}catch(e){if(e.message!=='offline'){S.session=null;save()}return null}}
};
function setSession(r){S.session={access_token:r.access_token,refresh_token:r.refresh_token,expires_at:Date.now()+(r.expires_in||3600)*1000,uid:r.user?.id||S.session?.uid,email:r.user?.email||S.session?.email};save()}
// volta do login do Google: tokens vêm no #hash
(function captureLogin(){if(!ONLINE||!location.hash.includes('access_token'))return;
 try{const p=new URLSearchParams(location.hash.slice(1));const at=p.get('access_token');if(at){S.session={access_token:at,refresh_token:p.get('refresh_token'),expires_at:Date.now()+(+p.get('expires_in')||3600)*1000};
  try{const pay=JSON.parse(atob(at.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));S.session.uid=pay.sub;S.session.email=pay.email}catch{}
  save();history.replaceState(null,'',location.pathname+location.search);S.reopen=true}}catch{}})();

// ---------------- dados ----------------
async function myProfile(){const tok=await api.token();if(!tok||!S.session?.uid)return null;
 const r=await api.req(`/rest/v1/profiles?id=eq.${S.session.uid}&select=nick`,{tok});return r&&r[0]||null}
async function setNick(nick){if(ONLINE&&S.session){const tok=await api.token();await api.req('/rest/v1/rpc/set_nick',{method:'POST',body:{p_nick:nick},tok})}S.nick=nick;save();if(ONLINE&&S.session){for(const [lv,r] of Object.entries(S.best)){try{await submit(lv,r.ms,3,0)}catch{}}}}
async function submit(lv,ms,stars,kills){
 if(!ONLINE||!S.session||!S.nick)return null;const tok=await api.token();if(!tok)return null;
 await api.req('/rest/v1/rpc/submit_run',{method:'POST',body:{p_level:lv,p_ms:ms,p_stars:stars,p_kills:kills},tok});
 const r=await api.req('/rest/v1/rpc/my_rank',{method:'POST',body:{p_level:lv},tok});return r&&r[0]||null}
async function board(kind,arg){
 if(!ONLINE){ // modo local: só você
  const me=S.nick||'Você',rows=[];const b=S.best;
  if(kind==='level'){const r=b[lvId(arg)];if(r)rows.push({nick:me,ms:r.ms,me:true})}
  else if(kind==='world'){let k=0;for(let w=0;w<arg;w++)k+=WORLDS[w].c;let sum=0,n=0;for(let i=1;i<=WORLDS[arg].c;i++){const r=b[lvId(k+i)];if(r){sum+=r.ms;n++}}if(n===WORLDS[arg].c)rows.push({nick:me,ms:sum,me:true})}
  else{let sum=0,n=0;for(let i=1;i<=TOTAL;i++){const r=b[lvId(i)];if(r){sum+=r.ms;n++}}if(n)rows.push({nick:me,ms:sum,done:n,me:true})}
  return rows}
 const tok=await api.token(),Q=p=>api.req('/rest/v1/'+p,{tok});
 if(kind==='level')return (await Q(`leaderboard?level_id=eq.${lvId(arg)}&select=user_id,nick,time_ms&order=time_ms.asc,achieved_at.asc&limit=50`)).map(r=>({nick:r.nick,ms:r.time_ms,me:r.user_id===S.session?.uid}));
 if(kind==='world')return (await Q(`world_board?world=eq.${arg+1}&levels_done=eq.${WORLDS[arg].c}&select=user_id,nick,total_ms&order=total_ms.asc&limit=50`)).map(r=>({nick:r.nick,ms:r.total_ms,me:r.user_id===S.session?.uid}));
 return (await Q('global_board?select=user_id,nick,levels_done,total_ms&order=levels_done.desc,total_ms.asc&limit=50')).map(r=>({nick:r.nick,ms:r.total_ms,done:r.levels_done,me:r.user_id===S.session?.uid}));
}

// ---------------- partida terminou ----------------
let lastRun=null;
globalThis.__btRun=async run=>{
 lastRun={...run,status:'none'};
 const perfect=!run.skip&&run.stars>=run.starsTotal&&run.ms>=3000;
 if(!perfect){lastRun.status='notperfect';return}
 const prev=S.best[run.lv];let rec=!prev||run.ms<prev.ms;
 if(rec){S.best[run.lv]={ms:run.ms,at:Date.now()};save()}
 lastRun.status=rec?'record':'slower';lastRun.best=S.best[run.lv].ms;
 if(ONLINE&&S.session&&S.nick){try{const r=await submit(run.lv,S.best[run.lv].ms,run.stars,run.kills);if(r){lastRun.rank=r.rank;lastRun.status=rec?'sent':'slower'}}catch{lastRun.status='offline'}}
 else if(ONLINE)lastRun.status='login';
 paintChip()};

// ---------------- UI ----------------
let root=null,st={tab:'global',world:0,level:1};
function ensureRoot(){if(root)return root;root=document.createElement('div');root.className='pn-rank';root.hidden=true;document.body.append(root);
 root.addEventListener('click',onClick);['pointerdown','touchstart','keydown'].forEach(n=>root.addEventListener(n,e=>e.stopPropagation(),{passive:true}));return root}
const trophy='<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M7 3h10v2h3v3c0 2.2-1.6 4-3.7 4.4A5 5 0 0 1 13 15.9V18h3v3H8v-3h3v-2.1a5 5 0 0 1-3.3-3.5C5.6 12 4 10.2 4 8V5h3V3zm-1 4v1c0 1 .6 1.8 1.4 2.2A9 9 0 0 1 7 7H6zm12 0h-1a9 9 0 0 1-.4 3.2c.8-.4 1.4-1.2 1.4-2.2V7z"/></svg>';
async function open(startLv){
 ensureRoot();root.hidden=false;document.documentElement.classList.add('pn-rank-open');sfx('open');
 if(startLv){const n=+String(startLv).slice(1);if(n){st.tab='level';st.level=n;st.world=worldOf(n-1).w}}
 render()}
function close(){if(root){root.hidden=true}document.documentElement.classList.remove('pn-rank-open');sfx('close')}
async function render(){
 const r=ensureRoot();const logged=!ONLINE||!!S.session,hasNick=!!S.nick;
 const tabs=[['global','Global'],['world','Mundos'],['level','Fases']].map(([k,l])=>`<button class="${st.tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('');
 let sub='';
 if(st.tab==='world')sub=`<div class="pn-sub">${WORLDS.map((w,i)=>`<button class="${st.world===i?'on':''}" data-world="${i}">${w.n}</button>`).join('')}</div>`;
 if(st.tab==='level'){const w=WORLDS[st.world];let k=0;for(let i=0;i<st.world;i++)k+=WORLDS[i].c;
  sub=`<div class="pn-sub">${WORLDS.map((x,i)=>`<button class="${st.world===i?'on':''}" data-world="${i}">${x.n}</button>`).join('')}</div><div class="pn-sub lvs">${Array.from({length:w.c},(_,i)=>`<button class="${st.level===k+i+1?'on':''}" data-level="${k+i+1}">${i+1}</button>`).join('')}</div>`}
 const acct=!logged?`<button class="pn-go" data-act="google"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#fff" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#fff" opacity=".8" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.800-1.800-5.600-4.100H3.100v2.600A10 10 0 0 0 12 22z"/><path fill="#fff" opacity=".6" d="M6.400 14c-.2-.6-.3-1.300-.3-2s.1-1.400.3-2V7.400H3.100a10 10 0 0 0 0 9.200L6.400 14z"/><path fill="#fff" opacity=".9" d="M12 5.900c1.500 0 2.800.5 3.800 1.500l2.900-2.900A10 10 0 0 0 3.100 7.400L6.400 10c.8-2.300 3-4.100 5.600-4.100z"/></svg>Entrar com Google</button>`
  :!hasNick?`<form class="pn-nick"><input maxlength="16" minlength="3" placeholder="Escolha seu nick (3 a 16)" autocomplete="off" required><button class="pn-go">Salvar</button></form>`
  :`<div class="pn-me"><b>${esc(S.nick)}</b><button data-act="nick">trocar nick</button>${ONLINE?'<button data-act="logout">sair</button><button data-act="delete" class="warn">excluir perfil</button>':''}</div>`;
 r.innerHTML=`<div class="pn-card"><header><button class="pn-x" data-act="close" aria-label="Fechar">✕</button><h2>${trophy} RANKING</h2><p class="rule">Só vale tempo com <b>todas as estrelas</b>. Menor tempo vence.</p></header>
  <div class="pn-tabs">${tabs}</div>${sub}<div class="pn-list" aria-live="polite"><p class="msg">Carregando…</p></div>
  <footer>${acct}${ONLINE?'':'<p class="pn-test">MODO LOCAL · ranking só neste aparelho (servidor ainda não configurado)</p>'}</footer></div>`;
 const list=r.querySelector('.pn-list');
 try{
  const rows=await board(st.tab,st.tab==='world'?st.world:st.level);
  if(!rows.length){list.innerHTML=`<p class="msg">${st.tab==='global'?'Ninguém terminou nenhuma fase com todas as estrelas ainda.':st.tab==='world'?'Ninguém completou este mundo com todas as estrelas ainda.':'Ninguém tem o tempo perfeito desta fase. Seja o primeiro!'}</p>`;return}
  const medal=['🥇','🥈','🥉'];
  list.innerHTML=rows.map((x,i)=>`<div class="pn-row ${x.me?'me':''} ${i<3?'top'+(i+1):''}" style="animation-delay:${Math.min(i,12)*30}ms"><span class="pos">${i<3?medal[i]:i+1}</span><span class="nm">${esc(x.nick)}${x.me?' <i>você</i>':''}</span>${x.done!=null?`<span class="dn">${x.done}/${TOTAL}</span>`:''}<span class="tm">${fmt(x.ms)}</span></div>`).join('');
 }catch(e){list.innerHTML=`<p class="msg">${e.message==='offline'?'Sem conexão com o ranking. Tente de novo.':'Erro ao carregar o ranking.'}</p>`}
}
async function onClick(e){
 const b=e.target.closest('button');if(!b){if(e.target===root)close();return}
 if(b.dataset.tab){st.tab=b.dataset.tab;render();return}
 if(b.dataset.world!=null){st.world=+b.dataset.world;if(st.tab==='level'){let k=0;for(let i=0;i<st.world;i++)k+=WORLDS[i].c;st.level=k+1}render();return}
 if(b.dataset.level){st.level=+b.dataset.level;render();return}
 const a=b.dataset.act;if(!a)return;
 if(a==='close')close();
 else if(a==='google')location.href=api.googleUrl();
 else if(a==='nick'){S.nick='';save();render()}
 else if(a==='logout'){S.session=null;S.nick='';save();render()}
 else if(a==='delete'){if(confirm('Excluir seu perfil e todos os seus tempos do ranking? Não dá para desfazer.')){try{const tok=await api.token();await api.req('/rest/v1/rpc/delete_me',{method:'POST',body:{},tok})}catch{}S={nick:'',best:{},session:null};save();render()}}
}
document.addEventListener('submit',async e=>{const f=e.target.closest&&e.target.closest('.pn-nick');if(!f)return;e.preventDefault();
 const v=f.querySelector('input').value.trim();if(v.length<3||v.length>16)return;const btn=f.querySelector('button');btn.disabled=true;
 try{await setNick(v);sfx('equip');render();paintChip()}catch(err){btn.disabled=false;f.querySelector('input').setCustomValidity('Esse nick já existe. Tente outro.');f.querySelector('input').reportValidity();setTimeout(()=>f.querySelector('input').setCustomValidity(''),1500)}});
// recupera o perfil depois do login Google
(async()=>{if(ONLINE&&S.session){try{const p=await myProfile();if(p){S.nick=p.nick;save()}}catch{}}if(S.reopen){delete S.reopen;save();setTimeout(()=>open(),700)}})();

// botões no menu e chip no resultado
function inject(){
 const sec=document.querySelector('#ui .title-secondary');
 if(sec&&!sec.querySelector('.pn-rank-btn')){const b=document.createElement('button');b.type='button';b.className='btn pn-rank-btn';b.innerHTML=trophy+'<span>Ranking</span>';b.addEventListener('click',ev=>{ev.stopPropagation();open()});sec.prepend(b)}
 paintChip()}
function paintChip(){
 const res=document.querySelector('#ui .result');if(!res||res.hidden)return;let chip=res.querySelector('.pn-rank-chip');
 const card=res.querySelector('.card');if(!card)return;if(!chip){chip=document.createElement('button');chip.type='button';chip.className='pn-rank-chip';chip.addEventListener('click',ev=>{ev.stopPropagation();open(lastRun?.lv)});card.append(chip)}
 const r=lastRun;let t='🏆 Ranking';
 if(r){if(r.status==='notperfect')t='🏆 Ranking: pegue todas as estrelas para entrar';
  else if(r.status==='login')t=S.session?'🏆 Escolha seu nick para registrar o tempo':'🏆 Entre com Google para registrar '+fmt(r.ms);
  else if(r.status==='sent')t=`🏆 Tempo enviado! Você é #${r.rank}`;
  else if(r.status==='record')t=`🏆 Novo recorde: ${fmt(r.ms)}`+(S.nick?'':' · toque para criar seu perfil');
  else if(r.status==='slower')t=`🏆 Seu recorde continua: ${fmt(r.best)}`;
  else if(r.status==='offline')t='🏆 Sem conexão — o tempo fica salvo e entra depois'}
 if(chip.textContent!==t)chip.textContent=t;chip.classList.toggle('good',!!r&&(r.status==='sent'||r.status==='record'))}
const ui=document.getElementById('ui');
if(ui){let raf=0;new MutationObserver(()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;inject()})}).observe(ui,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});setTimeout(inject,500)}
window.potatinjaRank={open,close};
