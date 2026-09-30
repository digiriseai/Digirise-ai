// DigiRise Worker
// Required Cloudflare Workers AI binding: AI

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DigiRise — Turn a sentence into an image</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%221%22 x2=%221%22 y2=%220%22><stop offset=%220%22 stop-color=%22%23FF6B4A%22/><stop offset=%221%22 stop-color=%22%23FFC857%22/></linearGradient></defs><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%230F1220%22/><path d=%22M20 68 L45 40 L60 55 L82 25%22 stroke=%22url(%23g)%22 stroke-width=%229%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0F1220;
    --surface:#171B2E;
    --surface-2:#1F2440;
    --border:#2A3050;
    --text:#F5F3EE;
    --text-mute:#9AA0BC;
    --coral:#FF6B4A;
    --gold:#FFC857;
    --violet:#8B7FFF;
    --rise: linear-gradient(135deg, var(--coral), var(--gold));
    --radius: 14px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{
    margin:0;
    background:var(--bg);
    color:var(--text);
    font-family:'Inter', system-ui, sans-serif;
    line-height:1.5;
    -webkit-font-smoothing:antialiased;
  }
  h1,h2,h3,.display{
    font-family:'Bricolage Grotesque', 'Inter', sans-serif;
    font-weight:800;
    line-height:1.05;
    margin:0;
    letter-spacing:-0.01em;
  }
  p{color:var(--text-mute); margin:0;}
  a{color:inherit;}
  img{max-width:100%; display:block;}
  .wrap{max-width:1120px; margin:0 auto; padding:0 24px;}
  .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    padding:13px 24px; border-radius:999px; border:none; cursor:pointer;
    font-family:'Inter', sans-serif; font-weight:600; font-size:15px;
    text-decoration:none; transition:transform .15s ease, opacity .15s ease;
  }
  .btn:active{transform:scale(0.97);}
  .btn-primary{background:var(--rise); color:#161018;}
  .btn-primary:hover{opacity:.92;}
  .btn-ghost{background:transparent; color:var(--text); border:1px solid var(--border);}
  .btn-ghost:hover{border-color:var(--violet);}
  .btn:disabled{opacity:.45; cursor:not-allowed;}

  /* Nav */
  header{
    position:sticky; top:0; z-index:40;
    background:rgba(15,18,32,0.85); backdrop-filter:blur(10px);
    border-bottom:1px solid var(--border);
  }
  nav{display:flex; align-items:center; justify-content:space-between; padding:16px 24px;}
  .logo{display:flex; align-items:center; gap:10px; font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:20px;}
  .logo-mark{width:30px; height:30px; border-radius:8px; background:var(--bg); border:1px solid var(--border); position:relative; flex-shrink:0;}
  .logo-mark svg{position:absolute; inset:5px;}
  .nav-links{display:flex; gap:28px; align-items:center;}
  .nav-links a{color:var(--text-mute); text-decoration:none; font-size:15px; font-weight:500;}
  .nav-links a:hover{color:var(--text);}
  .nav-cta{display:flex; align-items:center; gap:14px;}

  /* Hero */
  .hero{padding:72px 0 88px; position:relative; overflow:hidden;}
  .hero-grid{display:grid; grid-template-columns:1.05fr 1fr; gap:56px; align-items:start;}
  .hero-copy{padding-top:8px;}
  .hero h1{font-size:clamp(36px, 5vw, 58px);}
  .hero h1 span{background:var(--rise); -webkit-background-clip:text; background-clip:text; color:transparent;}
  .hero p.lede{font-size:18px; margin-top:20px; max-width:46ch;}
  .hero-actions{display:flex; gap:14px; margin-top:32px; flex-wrap:wrap;}
  .hero-note{margin-top:18px; font-size:13px; color:var(--text-mute);}

  .rise-in{opacity:0; transform:translateY(18px); animation:riseIn .7s cubic-bezier(.2,.8,.2,1) forwards;}
  .rise-in.d1{animation-delay:.05s;} .rise-in.d2{animation-delay:.15s;} .rise-in.d3{animation-delay:.25s;} .rise-in.d4{animation-delay:.35s;}
  @keyframes riseIn{to{opacity:1; transform:translateY(0);}}
  @media (prefers-reduced-motion: reduce){ .rise-in{animation:none; opacity:1; transform:none;} }

  /* Generator card */
  .gen-card{
    background:var(--surface); border:1px solid var(--border); border-radius:20px;
    padding:22px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.6);
  }
  .gen-card label{display:block; font-size:13px; color:var(--text-mute); margin-bottom:8px;}
  .gen-card textarea{
    width:100%; resize:none; min-height:74px; padding:13px 14px; border-radius:12px;
    background:var(--surface-2); border:1px solid var(--border); color:var(--text);
    font-family:'Inter',sans-serif; font-size:14.5px;
  }
  .gen-card textarea:focus{outline:2px solid var(--violet); outline-offset:1px;}
  .style-row{display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;}
  .style-chip{
    padding:7px 13px; border-radius:999px; border:1px solid var(--border); background:transparent;
    color:var(--text-mute); font-size:13px; cursor:pointer; font-family:'Inter',sans-serif;
  }
  .style-chip.active{border-color:var(--gold); color:var(--gold); background:rgba(255,200,87,0.08);}
  .gen-actions{display:flex; align-items:center; justify-content:space-between; margin-top:16px; gap:12px;}
  .gen-actions .btn{width:100%;}

  .result-frame{
    margin-top:16px; aspect-ratio:1/1; border-radius:14px; overflow:hidden;
    background:var(--surface-2); border:1px solid var(--border);
    display:flex; align-items:center; justify-content:center; position:relative;
  }
  .result-frame img{width:100%; height:100%; object-fit:cover;}
  .result-empty{color:var(--text-mute); font-size:13.5px; text-align:center; padding:20px;}
  .result-tools{display:flex; gap:10px; margin-top:12px;}
  .result-tools .btn{width:100%;}
  .spinner{width:26px; height:26px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--gold); animation:spin .8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  .meter{margin-top:16px;}
  .meter-track{height:6px; border-radius:99px; background:var(--surface-2); overflow:hidden; border:1px solid var(--border);}
  .meter-fill{height:100%; width:0%; background:var(--rise); transition:width .4s ease;}
  .meter-label{font-size:12.5px; color:var(--text-mute); margin-top:8px;}

  /* Sections generic */
  section{padding:88px 0;}
  .section-head{max-width:560px; margin-bottom:44px;}
  .section-head h2{font-size:clamp(28px,3.4vw,38px);}
  .section-head p{margin-top:14px; font-size:16px;}

  /* Steps */
  .steps{display:grid; grid-template-columns:repeat(3,1fr); gap:28px;}
  .step{border-top:1px solid var(--border); padding-top:20px;}
  .step-num{font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:15px; color:var(--gold);}
  .step h3{font-size:19px; margin-top:10px;}
  .step p{margin-top:8px; font-size:14.5px;}

  /* Gallery */
  .gallery-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:16px;}
  .gal-item{border-radius:14px; overflow:hidden; border:1px solid var(--border); background:var(--surface); position:relative; aspect-ratio:1/1;}
  .gal-item img{width:100%; height:100%; object-fit:cover; transition:transform .4s ease;}
  .gal-item:hover img{transform:scale(1.05);}
  .gal-caption{
    position:absolute; inset:auto 0 0 0; padding:12px; background:linear-gradient(to top, rgba(10,10,16,.85), transparent);
    display:flex; align-items:flex-end; justify-content:space-between; gap:8px;
  }
  .gal-caption span{font-size:13px;}
  .gal-try{background:rgba(255,255,255,.12); border:none; color:var(--text); font-size:12px; padding:6px 11px; border-radius:999px; cursor:pointer; font-family:'Inter',sans-serif;}

  /* Pricing */
  .pricing-grid{display:grid; grid-template-columns:1fr 1fr; gap:24px;}
  .plan{border:1px solid var(--border); border-radius:18px; padding:30px; background:var(--surface);}
  .plan.pro{border-color:var(--gold); background:linear-gradient(180deg, rgba(255,200,87,.06), var(--surface) 60%);}
  .plan-name{font-size:14px; color:var(--text-mute); font-weight:600;}
  .plan-price{font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:40px; margin-top:10px;}
  .plan-price small{font-size:15px; color:var(--text-mute); font-weight:500;}
  .plan-list{list-style:none; margin:22px 0 26px; padding:0; display:flex; flex-direction:column; gap:11px;}
  .plan-list li{font-size:14.5px; color:var(--text); padding-left:22px; position:relative;}
  .plan-list li::before{content:"+"; position:absolute; left:0; color:var(--gold); font-weight:700;}
  .plan .btn{width:100%;}

  /* FAQ */
  .faq-list{border-top:1px solid var(--border);}
  details{border-bottom:1px solid var(--border); padding:20px 0;}
  summary{cursor:pointer; font-size:16px; font-weight:600; list-style:none; display:flex; justify-content:space-between; align-items:center;}
  summary::-webkit-details-marker{display:none;}
  summary::after{content:"+"; color:var(--gold); font-size:20px; font-weight:400;}
  details[open] summary::after{content:"–";}
  details p{margin-top:12px; font-size:14.5px; max-width:60ch;}

  /* Modal */
  .modal-backdrop{
    position:fixed; inset:0; background:rgba(8,9,16,.72); backdrop-filter:blur(3px);
    display:none; align-items:center; justify-content:center; z-index:100; padding:20px;
  }
  .modal-backdrop.open{display:flex;}
  .modal{background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:30px; max-width:400px; width:100%;}
  .modal h3{font-size:22px;}
  .modal p{margin-top:10px; font-size:14.5px;}
  .modal .btn{width:100%; margin-top:20px;}
  .modal-close{background:none; border:none; color:var(--text-mute); font-size:13px; margin-top:12px; cursor:pointer; width:100%; text-align:center; font-family:'Inter',sans-serif;}

  footer{border-top:1px solid var(--border); padding:36px 0; }
  .footer-row{display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;}
  .footer-row p{font-size:13px;}

  @media (max-width:840px){
    .hero-grid{grid-template-columns:1fr;}
    .steps{grid-template-columns:1fr;}
    .gallery-grid{grid-template-columns:repeat(2,1fr);}
    .pricing-grid{grid-template-columns:1fr;}
    .nav-links{display:none;}
  }

  .ai-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:.08em;color:var(--gold);margin-bottom:8px;}
  .admin-link{color:var(--gold)!important;font-weight:700!important;}
  @media (max-width:700px){.nav-links{gap:12px;overflow-x:auto;padding-bottom:3px}.nav-links a{white-space:nowrap;font-size:13px}.nav-cta{display:none}}
</style>
</head>
<body>

<header>
  <nav class="wrap">
    <div class="logo">
      <span class="logo-mark">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 17 L9 10 L13 14 L21 5" stroke="url(#navg)" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="navg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF6B4A"/><stop offset="1" stop-color="#FFC857"/></linearGradient></defs></svg>
      </span>
      DigiRise
    </div>
    <div class="nav-links">
      <a href="#generate">Generate</a>
      <a href="#gallery">Gallery</a>
      <a href="#pricing">Pricing</a>
      <a href="#faq">FAQ</a>
      <a href="/admin" class="admin-link">Admin</a>
    </div>
    <div class="nav-cta">
      <a href="#pricing" class="btn btn-ghost" style="padding:9px 18px; font-size:14px;">Get Pro</a>
    </div>
  </nav>
</header>

<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 class="rise-in d1">Turn a sentence into <span>an image.</span></h1>
      <p class="lede rise-in d2">DigiRise generates original AI art from your prompt in seconds — no design skill, no software. Start free every day, upgrade whenever you outgrow the limit.</p>
      <div class="hero-actions rise-in d3">
        <a href="#generate" class="btn btn-primary">Generate your first image</a>
        <a href="#pricing" class="btn btn-ghost">See pricing</a>
      </div>
      <p class="hero-note rise-in d4">Free tier: 10 AI images a day, no account needed.</p>
    </div>

    <div class="gen-card rise-in d3" id="generate">
      <div class="ai-badge">✦ AI</div>
      <label for="prompt">Describe your image</label>
      <textarea id="prompt" placeholder="A lighthouse at dawn, painted in watercolor"></textarea>
      <div class="style-row" id="styleRow">
        <button class="style-chip active" data-style="">Default</button>
        <button class="style-chip" data-style="digital painting, vivid colors">Painting</button>
        <button class="style-chip" data-style="anime style, studio quality">Anime</button>
        <button class="style-chip" data-style="3d render, octane, soft lighting">3D render</button>
        <button class="style-chip" data-style="photorealistic, 35mm photo">Photo</button>
      </div>
      <div class="gen-actions">
        <button class="btn btn-primary" id="generateBtn">Generate image</button>
      </div>

      <div class="result-frame" id="resultFrame">
        <div class="result-empty">Your image will appear here</div>
      </div>

      <div class="result-tools" id="resultTools"></div>

      <div class="meter">
        <div class="meter-track"><div class="meter-fill" id="meterFill"></div></div>
        <div class="meter-label" id="meterLabel">10 of 10 free AI generations left today</div>
      </div>
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <div class="section-head">
      <h2>Three steps, no learning curve</h2>
      <p>DigiRise is built for people who want an image now, not a new piece of software to learn.</p>
    </div>
    <div class="steps">
      <div class="step">
        <div class="step-num">01</div>
        <h3>Describe your image</h3>
        <p>Type what you want to see. Add a style if you have one in mind — or leave it to the default look.</p>
      </div>
      <div class="step">
        <div class="step-num">02</div>
        <h3>DigiRise generates it</h3>
        <p>Your prompt is sent to the image model and a unique picture comes back in a few seconds.</p>
      </div>
      <div class="step">
        <div class="step-num">03</div>
        <h3>Download and use it</h3>
        <p>Save the result and use it for personal or commercial projects — free tier included.</p>
      </div>
    </div>
  </div>
</section>

<section id="gallery">
  <div class="wrap">
    <div class="section-head">
      <h2>Made with DigiRise</h2>
      <p>A few examples generated from real prompts. Tap any of them to try the prompt yourself.</p>
    </div>
    <div class="gallery-grid" id="galleryGrid"></div>
  </div>
</section>

<section id="pricing">
  <div class="wrap">
    <div class="section-head">
      <h2>Free to start, simple to grow</h2>
      <p>Use DigiRise for free every day. Upgrade only when the daily limit stops being enough.</p>
    </div>
    <div class="pricing-grid">
      <div class="plan">
        <div class="plan-name">Free</div>
        <div class="plan-price">$0 <small>/ forever</small></div>
        <ul class="plan-list">
          <li>10 AI image generations per day</li>
          <li>Standard 768px resolution</li>
          <li>All styles included</li>
          <li>Personal &amp; commercial use</li>
        </ul>
        <a href="#generate" class="btn btn-ghost">Start generating</a>
      </div>
      <div class="plan pro">
        <div class="plan-name">Pro</div>
        <div class="plan-price">$9 <small>/ month</small></div>
        <ul class="plan-list">
          <li>Unlimited image generations</li>
          <li>HD 1024px resolution</li>
          <li>Priority generation speed</li>
          <li>Early access to new styles</li>
        </ul>
        <a href="#" id="proBtn" class="btn btn-primary">Upgrade to Pro</a>
      </div>
    </div>
  </div>
</section>

<section id="faq">
  <div class="wrap">
    <div class="section-head">
      <h2>Questions, answered</h2>
    </div>
    <div class="faq-list">
      <details>
        <summary>Is it actually free?</summary>
        <p>Yes. Everyone gets 10 AI image generations per day with no account and no payment details required. Pro removes the daily limit.</p>
      </details>
      <details>
        <summary>What happens when I hit the daily limit?</summary>
        <p>Generation pauses until the limit resets at midnight, or you can upgrade to Pro for unlimited generations right away.</p>
      </details>
      <details>
        <summary>Can I use the images commercially?</summary>
        <p>Yes, images from both the Free and Pro plans can be used for personal and commercial projects.</p>
      </details>
      <details>
        <summary>How do I cancel Pro?</summary>
        <p>Pro is billed monthly and you can cancel anytime from your billing confirmation email — you'll keep Pro access until the end of the period you already paid for.</p>
      </details>
    </div>
  </div>
</section>

<footer>
  <div class="wrap footer-row">
    <div class="logo" style="font-size:16px;">
      <span class="logo-mark" style="width:24px; height:24px;">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 17 L9 10 L13 14 L21 5" stroke="url(#fg)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="fg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF6B4A"/><stop offset="1" stop-color="#FFC857"/></linearGradient></defs></svg>
      </span>
      DigiRise
    </div>
    <p>© 2026 DigiRise. Images generated via open AI image models.</p>
  </div>
</footer>

<div class="modal-backdrop" id="upgradeModal">
  <div class="modal">
    <h3>You've used today's free images</h3>
    <p>You've reached the 10 free AI generations for today. Come back tomorrow, or upgrade to Pro for unlimited generations, HD output, and priority speed.</p>
    <a href="#" id="modalProBtn" class="btn btn-primary">Upgrade to Pro — $9/mo</a>
    <button class="modal-close" id="modalClose">Maybe tomorrow</button>
  </div>
</div>

<script>
  // ---- CONFIG ----
  const FREE_LIMIT = 10;
  // Replace with your own Stripe Payment Link (create one free in the Stripe dashboard, no code needed).
  const STRIPE_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_LINK";

  const promptEl = document.getElementById('prompt');
  const generateBtn = document.getElementById('generateBtn');
  const resultFrame = document.getElementById('resultFrame');
  const resultTools = document.getElementById('resultTools');
  const meterFill = document.getElementById('meterFill');
  const meterLabel = document.getElementById('meterLabel');
  const styleRow = document.getElementById('styleRow');
  const modal = document.getElementById('upgradeModal');

  document.getElementById('proBtn').href = STRIPE_LINK;
  document.getElementById('modalProBtn').href = STRIPE_LINK;

  let activeStyle = "";
  styleRow.addEventListener('click', (e)=>{
    const chip = e.target.closest('.style-chip');
    if(!chip) return;
    [...styleRow.children].forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    activeStyle = chip.dataset.style;
  });

  function todayKey(){
    return new Date().toISOString().slice(0,10);
  }
  function getUsage(){
    try{
      const raw = JSON.parse(localStorage.getItem('digirise_usage') || 'null');
      if(raw && raw.date === todayKey()) return raw;
    }catch(e){}
    return { date: todayKey(), count: 0 };
  }
  function saveUsage(u){
    try{ localStorage.setItem('digirise_usage', JSON.stringify(u)); }catch(e){}
  }
  function paintMeter(left){
    left = Math.max(0, Math.min(FREE_LIMIT, Number(left)));
    meterFill.style.width = ((FREE_LIMIT-left) / FREE_LIMIT * 100) + '%';
    meterLabel.textContent = left > 0
      ? \`\${left} of \${FREE_LIMIT} free generations left today\`
      : \`Daily limit reached — resets tomorrow\`;
    if(!cooling) generateBtn.disabled = left <= 0;
  }
  function updateMeter(){
    const u = getUsage();
    paintMeter(FREE_LIMIT - u.count);
    fetch('/quota', {cache:'no-store'}).then(r=>r.json()).then(q=>{
      if(q && q.success){
        const count = FREE_LIMIT - Number(q.remaining);
        saveUsage({date:todayKey(), count:Math.max(0, Math.min(FREE_LIMIT, count))});
        paintMeter(q.remaining);
      }
    }).catch(()=>{});
  }
  updateMeter();

  function openModal(){ modal.classList.add('open'); }
  document.getElementById('modalClose').addEventListener('click', ()=> modal.classList.remove('open'));
  modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('open'); });

  // Images are generated by this site's own Worker at POST /generate,
  // which runs Cloudflare Workers AI (flux-schnell) — no external API,
  // no third-party rate limits. A short cooldown just prevents accidental
  // rapid-fire clicks from burning AI usage.
  const COOLDOWN_MS = 4000;
  let cooling = false;

  function startCooldown(){
    cooling = true;
    let remaining = Math.ceil(COOLDOWN_MS / 1000);
    generateBtn.disabled = true;
    const tick = setInterval(() => {
      remaining -= 1;
      if(remaining <= 0){
        clearInterval(tick);
        cooling = false;
        generateBtn.textContent = 'Generate image';
        updateMeter();
      } else {
        generateBtn.textContent = \`Wait \${remaining}s…\`;
      }
    }, 1000);
  }

  async function generateImage(){
    if(cooling) return;
    const promptText = promptEl.value.trim();
    if(!promptText){ promptEl.focus(); return; }

    const u = getUsage();
    if(u.count >= FREE_LIMIT){ openModal(); return; }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating…';
    resultFrame.innerHTML = '<div class="spinner"></div>';
    resultTools.innerHTML = '';

    const fullPrompt = promptText + (activeStyle ? ', ' + activeStyle : '');

    try{
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await res.json();
      if(res.status === 429){
        saveUsage({date:todayKey(), count:FREE_LIMIT});
        paintMeter(0);
        openModal();
        throw new Error(data.error || 'Daily limit reached.');
      }
      if(!res.ok || !data.success){
        throw new Error(data.error || 'Generation failed.');
      }
      const img = new Image();
      img.src = data.image;
      img.alt = 'DigiRise AI generated image';
      resultFrame.innerHTML = '';
      resultFrame.appendChild(img);
      resultTools.innerHTML = '';
      const dl = document.createElement('a');
      dl.href = data.image;
      dl.download = 'DigiRise-AI-image.jpg';
      dl.className = 'btn btn-primary';
      dl.textContent = 'Download image';
      resultTools.appendChild(dl);
      if(typeof data.remaining === 'number'){
        saveUsage({date:todayKey(), count:FREE_LIMIT - data.remaining});
        paintMeter(data.remaining);
      } else {
        updateMeter();
      }
      startCooldown();
    }catch(err){
      const msg = err.name === 'AbortError' ? 'Generation timed out. Please try again.' : (err.message || 'please try again.');
      resultFrame.innerHTML = \`<div class="result-empty">Generation failed — \${msg}</div>\`;
      generateBtn.textContent = 'Generate image';
      generateBtn.disabled = false;
    }
  }
  generateBtn.addEventListener('click', generateImage);
  promptEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateImage();
  });

  // ---- Gallery ----
  // These are static gradient tiles, not live calls to the image API. Loading a
  // gallery of real generated images on every page visit would fire several
  // requests at once and immediately trip Pollinations' ~1-request-per-15s
  // anonymous rate limit. "Try this" still runs a real generation above.
  const galleryPrompts = [
    { text: "A lighthouse at dawn, watercolor", from: "#FF6B4A", to: "#8B7FFF" },
    { text: "Cyberpunk city street at night, neon", from: "#8B7FFF", to: "#0F1220" },
    { text: "A fox curled up in autumn leaves", from: "#FFC857", to: "#FF6B4A" },
    { text: "Floating islands above the clouds", from: "#8B7FFF", to: "#FFC857" },
    { text: "Cozy cabin in a snowy forest", from: "#171B2E", to: "#8B7FFF" },
    { text: "Astronaut planting a flag on Mars", from: "#FF6B4A", to: "#171B2E" },
  ];
  const galleryGrid = document.getElementById('galleryGrid');
  galleryPrompts.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'gal-item';
    div.innerHTML = \`
      <div style="width:100%;height:100%;background:linear-gradient(135deg, \${item.from}, \${item.to});"></div>
      <div class="gal-caption">
        <span>\${item.text}</span>
        <button class="gal-try">Try this</button>
      </div>\`;
    div.querySelector('.gal-try').addEventListener('click', ()=>{
      promptEl.value = item.text;
      document.getElementById('generate').scrollIntoView({behavior:'smooth', block:'center'});
      promptEl.focus();
    });
    galleryGrid.appendChild(div);
  });
</script>

</body>
</html>
`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FREE_LIMIT_SERVER = 10;

function quotaKey(request){
  return request.headers.get("CF-Connecting-IP") || "anonymous";
}

async function quotaRequest(env, request, action){
  const ip = quotaKey(request);
  const id = env.QUOTA.idFromName(ip);
  const stub = env.QUOTA.get(id);
  const res = await stub.fetch("https://quota/" + action, {method:"POST"});
  return res.json();
}

export class DigiRiseQuota {
  constructor(ctx, env){ this.ctx = ctx; this.env = env; }
  day(){ return new Date().toISOString().slice(0,10); }
  async fetch(request){
    const path = new URL(request.url).pathname;
    const today = this.day();
    let state = await this.ctx.storage.get("quota");
    if(!state || state.date !== today) state = {date:today, count:0};
    if(path === "/get"){
      return Response.json({success:true, remaining:Math.max(0, FREE_LIMIT_SERVER-state.count)});
    }
    if(path === "/reserve"){
      if(state.count >= FREE_LIMIT_SERVER) return Response.json({success:false, remaining:0, error:"Daily limit reached. Try again tomorrow."}, {status:429});
      state.count += 1;
      await this.ctx.storage.put("quota", state);
      return Response.json({success:true, remaining:FREE_LIMIT_SERVER-state.count});
    }
    if(path === "/release"){
      state.count = Math.max(0, state.count - 1);
      await this.ctx.storage.put("quota", state);
      return Response.json({success:true, remaining:FREE_LIMIT_SERVER-state.count});
    }
    return new Response("Not found", {status:404});
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, {headers:CORS});

    if (url.pathname === "/health") {
      return Response.json({ok:true, service:"DigiRise"}, {headers:{...CORS,"Cache-Control":"no-store"}});
    }

    if (url.pathname === "/quota" && request.method === "GET") {
      try {
        const q = await quotaRequest(env, request, "get");
        return Response.json(q, {headers:{...CORS,"Cache-Control":"no-store"}});
      } catch (e) {
        return Response.json({success:true, remaining:FREE_LIMIT_SERVER}, {headers:{...CORS,"Cache-Control":"no-store"}});
      }
    }

    if (url.pathname === "/generate" && request.method === "POST") {
      let reserved = false;
      try {
        if (!env.AI) throw new Error("Workers AI binding 'AI' is missing.");
        const {prompt} = await request.json();
        if (!prompt || !String(prompt).trim()) {
          return Response.json({success:false,error:"Please enter a prompt."},
            {status:400,headers:CORS});
        }
        const reservation = await quotaRequest(env, request, "reserve");
        if(!reservation.success) return Response.json(reservation, {status:429, headers:{...CORS,"Cache-Control":"no-store"}});
        reserved = true;
        const result = await env.AI.run(
          "@cf/black-forest-labs/flux-1-schnell",
          {prompt:String(prompt).trim()}
        );
        return Response.json(
          {success:true,image:"data:image/jpeg;base64," + result.image, remaining: reservation.remaining},
          {headers:{...CORS,"Cache-Control":"no-store"}}
        );
      } catch (e) {
        if(reserved){ try { await quotaRequest(env, request, "release"); } catch (_) {} }
        return Response.json(
          {success:false,error:e?.message || "Image generation failed."},
          {status:500,headers:CORS}
        );
      }
    }

    if (url.pathname === "/admin") {
      return new Response(
        "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1'><body style='font-family:Arial;padding:25px'><h1>🌈 DigiRise Admin</h1><p>Worker is online.</p><p><a href='/health'>Check Worker Health</a></p><p><a href='/'>Open DigiRise</a></p></body>",
        {headers:{"Content-Type":"text/html;charset=UTF-8",...CORS,"Cache-Control":"no-store"}}
      );
    }

    if (request.method === "GET") {
      return new Response(HTML, {
        headers:{"Content-Type":"text/html;charset=UTF-8",...CORS}
      });
    }

    return new Response("Not found",{status:404,headers:CORS});
  }
};
