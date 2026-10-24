'use strict';
const menuButton=document.querySelector('.menu-toggle');
const navigation=document.getElementById('navigation');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');navigation.classList.remove('open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menuButton.focus();}});
window.matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectTab(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectTab(tabs[next],true);}});});
document.querySelectorAll('[data-topic]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('topic').value=link.dataset.topic;}));
const imageDialog=document.getElementById('image-dialog');
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const img=document.getElementById('lightbox-image');img.src=button.dataset.image;img.alt=button.querySelector('img').alt;document.getElementById('lightbox-caption').textContent=button.dataset.caption;imageDialog.showModal();}));
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.dialog).showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});});
async function copyText(text){try{await navigator.clipboard.writeText(text);return true;}catch{const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.left='-9999px';document.body.append(field);field.select();const result=document.execCommand('copy');field.remove();return result;}}
const copyEmail=document.getElementById('copy-email');
copyEmail.addEventListener('click',async()=>{const ok=await copyText('biorivus@gmail.com');copyEmail.textContent=ok?'Skopiowano ✓':'biorivus@gmail.com';document.getElementById('copy-status').textContent=ok?'Adres e-mail został skopiowany.':'Skopiuj adres: biorivus@gmail.com';});
let lastBrief='';
document.getElementById('brief-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const topic=form.elements.topic.value;const organization=form.elements.organization.value.trim();const message=form.elements.message.value.trim();if(message.length<10){form.elements.message.setCustomValidity('Opisz krótko projekt — wpisz co najmniej 10 znaków.');form.elements.message.reportValidity();return;}lastBrief='Dzień dobry,\n\nInteresuje mnie: '+topic+'.\n\n'+message+(organization?'\n\nPozdrawiam,\n'+organization:'');document.getElementById('mail-fallback').hidden=false;window.location.href='mailto:biorivus@gmail.com?subject='+encodeURIComponent('Zapytanie BioRivus — '+topic)+'&body='+encodeURIComponent(lastBrief);});
document.getElementById('message').addEventListener('input',e=>e.target.setCustomValidity(''));
document.getElementById('copy-brief').addEventListener('click',async e=>{const ok=await copyText(lastBrief);e.currentTarget.textContent=ok?'skopiowano ✓':'kopiowanie niedostępne';});
