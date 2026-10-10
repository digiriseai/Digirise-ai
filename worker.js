import STORE_HTML from "./private/general-store.html";

const COOKIE_NAME = "digirise_owner_session";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function b64url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function signature(value, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}
function safeEqual(a, b) {
  const aa = encoder.encode(a), bb = encoder.encode(b);
  let diff = aa.length ^ bb.length;
  const n = Math.max(aa.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (aa[i % (aa.length || 1)] || 0) ^ (bb[i % (bb.length || 1)] || 0);
  return diff === 0;
}
function getCookie(request, name) {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const index = part.indexOf("=");
    if (index > -1 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return "";
}
async function hasValidSession(request, env) {
  if (!env.SESSION_SECRET) return false;
  const value = getCookie(request, COOKIE_NAME), split = value.lastIndexOf(".");
  if (split < 1) return false;
  const expires = value.slice(0, split), provided = value.slice(split + 1);
  if (!/^\d{10,}$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(provided, await signature(expires, env.SESSION_SECRET));
}
function secureHeaders(extra = {}) {
  return { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Cache-Control": "no-store, private", ...extra };
}
function htmlResponse(html, status = 200, extra = {}) {
  return new Response(html, { status, headers: secureHeaders({ "Content-Type": "text/html; charset=utf-8", ...extra }) });
}
function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: secureHeaders({ "Content-Type": "application/json; charset=utf-8" }) });
}
function loginPage(message = "Enter your owner password to continue.", next = "/owner-store") {
  const safeNext = next === "/owner-publish" ? "/owner-publish" : "/owner-store";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DigiRise Owner Login</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 80% 10%,#5442a8,transparent 35%),linear-gradient(135deg,#10172d,#202e61);font:16px system-ui;color:#17203a}.box{width:min(420px,100%);padding:30px;background:#fff;border-radius:24px;box-shadow:0 25px 80px #0004}.logo{font-size:13px;font-weight:900;letter-spacing:2px;color:#4f6cff;text-transform:uppercase}h1{margin:10px 0;font-size:27px}p{color:#66718a;font-size:14px}label{display:block;font-size:13px;font-weight:800;margin:20px 0 7px}input{width:100%;padding:14px;border:1px solid #d9dfed;border-radius:12px;font:inherit}button{width:100%;margin-top:14px;border:0;border-radius:12px;padding:14px;background:linear-gradient(120deg,#4f6cff,#8b5cf6);color:white;font:inherit;font-weight:900;cursor:pointer}.msg{padding:10px;border-radius:10px;background:#f2f4ff;color:#4351a8;font-size:13px}</style></head><body><main class="box"><div class="logo">DigiRise · Owner Access</div><h1>Private Owner Login</h1><p>Sign in to access your private store account or publish writing and video links.</p><div class="msg">${message}</div><form method="post" action="/owner-login?next=${safeNext}"><label for="password">Owner password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Sign in securely</button></form></main></body></html>`;
}
function redirect(path, headers = {}) { return new Response(null, { status: 303, headers: secureHeaders({ Location: path, ...headers }) }); }
function publishPage() {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DigiRise · Publish</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#f7f8fc;color:#11172d;font:16px system-ui}.wrap{max-width:760px;margin:24px auto}.box{background:white;border:1px solid #e5e9f3;border-radius:22px;padding:24px;box-shadow:0 18px 50px #121b3b12}h1{margin:0 0 8px}p{color:#64708a}label{display:block;font-weight:800;font-size:13px;margin:16px 0 6px}input,textarea,select{width:100%;padding:12px;border:1px solid #dce2ef;border-radius:11px;font:inherit}textarea{min-height:150px;resize:vertical}button,.link{display:inline-block;border:0;border-radius:12px;padding:12px 16px;background:linear-gradient(120deg,#4f6cff,#8b5cf6);color:white;font-weight:850;text-decoration:none;cursor:pointer;margin:10px 8px 0 0}.secondary{background:#11172d}.msg{margin-top:14px;padding:12px;border-radius:10px;background:#eef2ff;color:#3345a6;white-space:pre-wrap}.hint{font-size:12px}</style></head><body><main class="wrap"><div class="box"><h1>DigiRise · Publish</h1><p>Write an article or share a video link. Published items will appear on the public Virtual School page.</p><form id="publish-form"><label for="kind">Content type</label><select id="kind" name="kind"><option value="writing">Writing / Article</option><option value="video">Video link</option></select><label for="title">Title</label><input id="title" name="title" maxlength="120" required placeholder="Enter a title"><label for="body">Writing or description</label><textarea id="body" name="body" maxlength="12000" required placeholder="Write your article or describe the video"></textarea><div id="url-wrap" hidden><label for="url">Video URL (https://…)</label><input id="url" name="url" type="url" placeholder="https://…"><p class="hint">Share a public video link from a supported video platform. This form does not upload video files.</p></div><button type="submit">Publish</button><a class="link secondary" href="/owner-store">Open General Store</a><button type="button" class="secondary" id="logout">Log out</button><div id="message" class="msg" role="status" hidden></div></form></div></main><script>const kind=document.getElementById('kind'),urlWrap=document.getElementById('url-wrap'),urlInput=document.getElementById('url'),form=document.getElementById('publish-form'),msg=document.getElementById('message');function toggle(){const video=kind.value==='video';urlWrap.hidden=!video;urlInput.required=video;}kind.addEventListener('change',toggle);toggle();form.addEventListener('submit',async e=>{e.preventDefault();msg.hidden=false;msg.textContent='Publishing…';const data=Object.fromEntries(new FormData(form));try{const r=await fetch('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const out=await r.json();if(!r.ok)throw new Error(out.error||'Could not publish.');msg.textContent='Published successfully. It is now available on the public website.';form.reset();toggle();}catch(err){msg.textContent=err.message;}});document.getElementById('logout').addEventListener('click',async()=>{await fetch('/owner-logout',{method:'POST'});location.href='/owner-login';});</script></body></html>`;
}
function isValidContent(data) {
 if (!data || !["writing", "video"].includes(data.kind)) return false;
 if (typeof data.title !== "string" || !data.title.trim() || data.title.length > 120) return false;
 if (typeof data.body !== "string" || !data.body.trim() || data.body.length > 12000) return false;
 if (data.kind === "video") {
   if (typeof data.url !== "string" || data.url.length > 2000) return false;
   try { const u = new URL(data.url); if (u.protocol !== "https:" && u.protocol !== "http:") return false; } catch { return false; }
 }
 return true;
}
export default {
 async fetch(request, env) {
  const url = new URL(request.url), path = url.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/private/")) return new Response("Not Found", { status:404, headers:secureHeaders({"Content-Type":"text/plain; charset=utf-8"}) });
  if (path === "/api/posts" && request.method === "GET") {
   const id = env.CONTENT_STORE.idFromName("digirise-public-posts");
   return env.CONTENT_STORE.get(id).fetch("https://content-store/posts");
  }
  if (path === "/api/publish" && request.method === "POST") {
   if (!(await hasValidSession(request, env))) return jsonResponse({error:"Please sign in again to publish."},401);
   let data; try { data = await request.json(); } catch { return jsonResponse({error:"Invalid request."},400); }
   if (!isValidContent(data)) return jsonResponse({error:"Enter a title, content, and a valid http(s) video URL when sharing a video."},400);
   const id = env.CONTENT_STORE.idFromName("digirise-public-posts");
   return env.CONTENT_STORE.get(id).fetch("https://content-store/posts", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:data.kind,title:data.title.trim(),body:data.body.trim(),url:data.kind === "video" ? data.url.trim() : ""})});
  }
  if (path === "/owner-login" && request.method === "POST") {
   if (!env.STORE_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return htmlResponse(loginPage("Owner login is not configured. Set STORE_PASSWORD and SESSION_SECRET in Cloudflare Worker Secrets."),503);
   const form = await request.formData(), supplied = String(form.get("password") || "");
   if (!safeEqual(supplied, env.STORE_PASSWORD)) return htmlResponse(loginPage("Password was not accepted. Please try again.", url.searchParams.get("next")),401);
   const expires = String(Math.floor(Date.now()/1000)+SESSION_SECONDS), sig = await signature(expires,env.SESSION_SECRET);
   const next = url.searchParams.get("next") === "/owner-publish" ? "/owner-publish" : "/owner-store";
   return redirect(next,{"Set-Cookie":`${COOKIE_NAME}=${expires}.${sig}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`});
  }
  if (path === "/owner-logout" && request.method === "POST") return redirect("/owner-login",{"Set-Cookie":`${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`});
  if (path === "/owner-login") {
   if (!env.STORE_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return htmlResponse(loginPage("Before using private features, set STORE_PASSWORD and SESSION_SECRET in Cloudflare Worker Secrets."),503);
   const next = url.searchParams.get("next") === "/owner-publish" ? "/owner-publish" : "/owner-store";
   if (await hasValidSession(request,env)) return redirect(next);
   return htmlResponse(loginPage("Enter your owner password to continue.",next));
  }
  if (path === "/owner-store" || path === "/owner-store.html") {
   if (!(await hasValidSession(request,env))) return redirect("/owner-login");
   return htmlResponse(STORE_HTML);
  }
  if (path === "/owner-publish") {
   if (!(await hasValidSession(request,env))) return redirect("/owner-login?next=/owner-publish");
   return htmlResponse(publishPage());
  }
  if (!env.ASSETS) return new Response("DigiRise assets binding is not configured. Check wrangler.jsonc.",{status:500});
  return env.ASSETS.fetch(request);
 }
};

export class ContentStore {
 constructor(ctx) {
  this.ctx = ctx;
  this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)");
 }
 async fetch(request) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/posts") {
   const rows = this.ctx.storage.sql.exec("SELECT id, kind, title, body, url, created_at FROM posts ORDER BY id DESC LIMIT 100").toArray();
   return new Response(JSON.stringify({posts:rows}),{headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }
  if (request.method === "POST" && url.pathname === "/posts") {
   const data = await request.json();
   const created = new Date().toISOString();
   const result = this.ctx.storage.sql.exec("INSERT INTO posts (kind,title,body,url,created_at) VALUES (?,?,?,?,?)",data.kind,data.title,data.body,data.url || "",created);
   return new Response(JSON.stringify({ok:true,id:Number(result.lastRowId),created_at:created}),{status:201,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
  }
  return new Response("Not Found",{status:404});
 }
}
