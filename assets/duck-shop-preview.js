export function installDuckPreview(){
 const mount=()=>{
  const canvas=document.getElementById('skinPreview');if(!canvas||canvas.parentElement.querySelector('.duck-preview-controls'))return;
  canvas.dataset.previewMode='idle';
  const controls=document.createElement('div');controls.className='duck-preview-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Animação do personagem');
  for(const [id,label] of [['idle','Parado'],['jump','Saltar'],['aim','Mira'],['attack','Atacar'],['victory','Vitória']]){
   const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.mode=id;button.setAttribute('aria-pressed',String(id==='idle'));
   button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',e=>{e.stopPropagation();canvas.dataset.previewMode=id;for(const b of controls.children)b.setAttribute('aria-pressed',String(b===button));canvas.dispatchEvent(new Event('duck-preview-mode',{bubbles:true}))});controls.append(button);
  }
  canvas.parentElement.append(controls);
 };
 mount();new MutationObserver(mount).observe(document.getElementById('ui')||document.body,{childList:true,subtree:true});
}
