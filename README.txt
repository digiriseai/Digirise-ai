DigiRise deployment package

Files:
- worker.js       Main Cloudflare Worker
- wrangler.jsonc  Worker configuration with Workers AI binding named AI

Important:
- Do NOT use Custom Domains or Routes for this deployment.
- The Worker code expects the Workers AI binding variable to be exactly: AI
- The worker endpoint includes /health and /generate.
- The site includes /admin.

Deployment command if using Wrangler:
npx wrangler deploy

After deployment, test:
/health
/
/admin
DigiRise 
