function toggleMenu(){document.getElementById('menu')?.classList.toggle('open')}
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('#menu a').forEach(a=>a.addEventListener('click',()=>document.getElementById('menu')?.classList.remove('open'))));
function demo(e,msg){if(e)e.preventDefault();alert(msg)}
function sendChat(){const i=document.getElementById('chatInput'),b=document.getElementById('chatBox');if(!i||!i.value.trim())return;const q=i.value.trim();b.innerHTML+=`<div class="bubble user">${escapeHtml(q)}</div><div class="bubble bot">Demo response: Your secure AI backend can answer this message here.</div>`;i.value='';b.scrollTop=b.scrollHeight}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function generateDemo(kind){const out=document.getElementById('output');if(out)out.innerHTML=`<div class="card"><div class="icon">${kind==='image'?'🖼️':kind==='video'?'🎬':'🎨'}</div><h3>${kind==='image'?'Image Preview':kind==='video'?'Video Preview':'Design Preview'}</h3><p>Front-end preview ready. Connect your secure server/API to generate the real file.</p></div>`}
