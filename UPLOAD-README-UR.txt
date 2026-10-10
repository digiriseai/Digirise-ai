DigiRise updated package

- public/index.html: public website; Learn and Quran Academy sections and Home hero removed. Virtual School and DigiRise Mart remain. Student/Login links removed if present.
- private/general-store.html: moved outside public assets so it is NOT exposed as a public website page. It is for the owner's private accounting. Cloudflare static hosting will not serve it from this folder; use it locally or add authentication before publishing it.
- worker.js and wrangler.jsonc: Cloudflare static assets setup.
- backup/original-index-backup.html: original master index backup, outside public assets.

Important: syntax/config/ZIP checks are not a live Cloudflare deployment test. Do not upload private/general-store.html into the public folder.
