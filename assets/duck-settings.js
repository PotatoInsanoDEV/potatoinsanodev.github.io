// Preferências extras do Batatinja Dash (separadas do perfil original).
const KEY='pato-ninja.extras.v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
export const duckSettings={ghost:saved.ghost!==false,timer:saved.timer!==false,hero:['classic','cute','elite'].includes(saved.hero)?saved.hero:'cute'};
export function setDuckSetting(name,value){duckSettings[name]=typeof value==='string'?value:!!value;try{localStorage.setItem(KEY,JSON.stringify(duckSettings))}catch{}}
