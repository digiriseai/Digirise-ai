export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method === "GET") {
      return new Response("DigiRise AI Image Generator is working!", {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("POST required", {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    try {
      const { prompt } = await request.json();

      if (!prompt || !prompt.trim()) {
        return Response.json(
          { success: false, error: "Please enter a prompt." },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      const result = await env.AI.run(
        "@cf/black-forest-labs/flux-1-schnell",
        {
          prompt: prompt.trim(),
          steps: 4
        }
      );

      return Response.json(
        {
          success: true,
          image: "data:image/jpeg;base64," + result.image
        },
        {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error.message || "Image generation failed"
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};
