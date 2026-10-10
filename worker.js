import STORE_HTML from "./private/general-store.html";

const COOKIE_NAME = "digirise_owner_session";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function b64url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(value) {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
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
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > -1 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return "";
}
async function hasValidSession(request, env) {
  if (!env.SESSION_SECRET) return false;
  const value = getCookie(request, COOKIE_NAME);
  const split = value.lastIndexOf(".");
  if (split < 1) return false;
  const expires = value.slice(0, split), provided = value.slice(split + 1);
  if (!/^\d{10,}$/.test(expires) || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = await signature(expires, env.SESSION_SECRET);
  return safeEqual(provided, expected);
}
function secureHeaders(extra = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store, private",
    ...extra
  };
}
function htmlResponse(html, status = 200, extra = {}) {
  return new Response(html, { status, headers: secureHeaders({ "Content-Type": "text/html; charset=utf-8", ...extra }) });
}
function loginPage(message = "Enter your owner password to continue.") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DigiRise Owner Login</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 80% 10%,#5442a8,transparent 35%),linear-gradient(135deg,#10172d,#202e61);font:16px system-ui;color:#17203a}.box{width:min(420px,100%);padding:30px;background:#fff;border-radius:24px;box-shadow:0 25px 80px #0004}.logo{font-size:13px;font-weight:900;letter-spacing:2px;color:#4f6cff;text-transform:uppercase}h1{margin:10px 0;font-size:27px}p{color:#66718a;font-size:14px}label{display:block;font-size:13px;font-weight:800;margin:20px 0 7px}input{width:100%;padding:14px;border:1px solid #d9dfed;border-radius:12px;font:inherit}button{width:100%;margin-top:14px;border:0;border-radius:12px;padding:14px;background:linear-gradient(120deg,#4f6cff,#8b5cf6);color:white;font:inherit;font-weight:900;cursor:pointer}.msg{padding:10px;border-radius:10px;background:#f2f4ff;color:#4351a8;font-size:13px}</style></head><body><main class="box"><div class="logo">DigiRise · Owner Access</div><h1>Private Store Account</h1><p>This area is not part of the public website. Sign in with your owner password.</p><div class="msg">${message}</div><form method="post" action="/owner-login"><label for="password">Owner password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Unlock private account</button></form></main></body></html>`;
}
function redirect(path, headers = {}) {
  return new Response(null, { status: 303, headers: secureHeaders({ Location: path, ...headers }) });
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/private/general-store.html" || path.startsWith("/private/")) {
      return new Response("Not Found", { status: 404, headers: secureHeaders({ "Content-Type": "text/plain; charset=utf-8" }) });
    }

    if (path === "/owner-login" && request.method === "POST") {
      if (!env.STORE_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
        return htmlResponse(loginPage("Owner login is not configured yet. Set STORE_PASSWORD and a random SESSION_SECRET (at least 32 characters) in Cloudflare Worker Secrets."), 503);
      }
      const form = await request.formData();
      const supplied = String(form.get("password") || "");
      if (!safeEqual(supplied, env.STORE_PASSWORD)) {
        return htmlResponse(loginPage("Password was not accepted. Please try again."), 401);
      }
      const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
      const sig = await signature(expires, env.SESSION_SECRET);
      return redirect("/owner-store", { "Set-Cookie": `${COOKIE_NAME}=${expires}.${sig}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict` });
    }

    if (path === "/owner-logout" && request.method === "POST") {
      return redirect("/owner-login", { "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
    }

    if (path === "/owner-login") {
      if (!env.STORE_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
        return htmlResponse(loginPage("Before using this private page, set STORE_PASSWORD and SESSION_SECRET in Cloudflare Worker Secrets."), 503);
      }
      if (await hasValidSession(request, env)) return redirect("/owner-store");
      return htmlResponse(loginPage());
    }

    if (path === "/owner-store" || path === "/owner-store.html") {
      if (!env.STORE_PASSWORD || !env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
        return htmlResponse(loginPage("Owner login is not configured yet. Set STORE_PASSWORD and SESSION_SECRET in Cloudflare Worker Secrets."), 503);
      }
      if (!(await hasValidSession(request, env))) return redirect("/owner-login");
      return htmlResponse(STORE_HTML);
    }

    if (!env.ASSETS) return new Response("DigiRise assets binding is not configured. Check wrangler.jsonc.", { status: 500 });
    return env.ASSETS.fetch(request);
  }
};
