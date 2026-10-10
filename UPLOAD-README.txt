DigiRise — updated Cloudflare starter files

CONTENTS
- worker.js: serves static files using Cloudflare Workers Static Assets
- wrangler.jsonc: Cloudflare Worker and public asset configuration
- public/index.html: modern responsive DigiRise homepage; AI Image has been completely omitted
- public/general-store.html: basic local-only memo/accounting page

HOMEPAGE SECTIONS
Virtual School, Quran Academy, DigiRise Mart, AI Video, AI Chat, General Store.
The School, Quran Academy, Mart, AI Video and AI Chat are landing sections only at this stage; their full functionality has not yet been built.

IMPORTANT
The General Store page saves entries only in the current browser/device. It has no login, server database, sync or secure user accounts. Do not use it for confidential business data yet.

DEPLOYMENT
These files have not been deployed or verified on your Cloudflare account. Upload the entire folder structure to the connected GitHub repository, preserving public/index.html and public/general-store.html paths, then deploy through your Cloudflare setup. Back up unrelated existing project files before replacing anything.
