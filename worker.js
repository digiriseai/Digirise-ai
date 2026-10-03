// DigiRise Cloudflare Worker
// Backend only: /health and /generate
// Requires a Workers AI binding named "AI".

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json(
        { ok: true, service: "DigiRise", aiBinding: !!env.AI },
        { headers: CORS }
      );
    }

    if (url.pathname === "/generate" && request.method === "POST") {
      try {
        if (!env.AI) {
          return Response.json(
            { success: false, error: "Workers AI binding AI is missing." },
            { status: 500, headers: CORS }
          );
        }

        const body = await request.json();
        const prompt = String(body?.prompt || "").trim();

        if (!prompt) {
          return Response.json(
            { success: false, error: "Prompt required." },
            { status: 400, headers: CORS }
          );
        }

        const result = await env.AI.run(
          "@cf/black-forest-labs/flux-1-schnell",
          { prompt }
        );

        if (!result || !result.image) {
          throw new Error("Cloudflare AI returned no image.");
        }

        return Response.json(
          {
            success: true,
            image: "data:image/jpeg;base64," + result.image
          },
          { headers: CORS }
        );
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error?.message || "Image generation failed."
          },
          { status: 500, headers: CORS }
        );
      }
    }

    return new Response("DigiRise Worker is online. Use GET /health or POST /generate.", {
      headers: CORS
    });
  }
};
