// DigiRise Worker: serves the website and provides the AI image API.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "DigiRise", aiBinding: Boolean(env.AI), assetsBinding: Boolean(env.ASSETS) });
    }

    if (url.pathname === "/generate") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      if (request.method !== "POST") {
        return json({ success: false, error: "Use POST for image generation." }, 405);
      }
      if (!env.AI) {
        return json({ success: false, error: "Workers AI binding AI is missing in this Worker." }, 500);
      }

      try {
        const body = await request.json();
        const prompt = String(body?.prompt || "").trim();
        if (!prompt) return json({ success: false, error: "Please enter an image prompt." }, 400);
        if (prompt.length > 2000) return json({ success: false, error: "Prompt is too long (maximum 2000 characters)." }, 400);

        const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt });
        if (!result || !result.image) {
          return json({ success: false, error: "Workers AI returned no image. Check model availability and account limits." }, 502);
        }

        // Workers AI FLUX returns a base64 image string.
        const image = typeof result.image === "string"
          ? "data:image/jpeg;base64," + result.image
          : "data:image/jpeg;base64," + btoa(String.fromCharCode(...new Uint8Array(result.image)));
        return json({ success: true, image });
      } catch (err) {
        return json({
          success: false,
          error: err?.message || "Image generation failed. Check Workers AI availability, limits, and permissions."
        }, 500);
      }
    }

    // Serve the static website for / and all page assets.
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("DigiRise is online, but the ASSETS binding is missing. Check wrangler.jsonc.", {
      status: 500,
      headers: CORS_HEADERS
    });
  }
};
