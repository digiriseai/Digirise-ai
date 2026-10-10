export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response(
      "DigiRise setup error: the ASSETS binding is missing. Check wrangler.jsonc.",
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }
};
