export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Serve static site assets through Cloudflare Workers Static Assets.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('DigiRise assets binding is not configured. Check wrangler.jsonc.', { status: 500 });
  }
};
