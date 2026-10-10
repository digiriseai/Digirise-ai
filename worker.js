export default {
  async fetch(request, env) {
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("DigiRise assets binding is not configured. Check wrangler.jsonc.", { status: 500 });
  }
};
