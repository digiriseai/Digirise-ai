DigiRise — Updated complete files

Is package mein:
1. index.html — Vercel ke root 404 ko dur karne ke liye root homepage
2. public/index.html — Cloudflare Worker Assets homepage
3. worker.js — Cloudflare Worker entry file
4. wrangler.jsonc — lowercase public folder ke sath matching configuration
5. private/general-store.html — General Store private folder mein
6. backup/original-index-backup.html — purani website ka backup

Zaroori:
- GitHub repository ke root mein index.html, worker.js aur wrangler.jsonc upload karein.
- public folder ke andar index.html upload karein.
- private folder ke andar general-store.html upload karein.
- backup folder ko backup ke liye rakhein; public site mein usay link na karein.
- Folder names exact lowercase rakhein: public, private, backup.
- Cloudflare Worker ke Static Assets directory ko ./public hi rehne dein.
- Vercel agar root directory deploy karta hai to root index.html ab maujood hai.

Note: Yeh files known path/case mismatch aur root index missing maslay ko fix karti hain. Live Cloudflare/Vercel deployment ko is package se upload kiye baghair 100% verify nahin kiya ja sakta.
