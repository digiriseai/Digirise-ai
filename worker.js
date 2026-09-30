export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});

    if (url.pathname === "/generate") {
      if (request.method !== "POST") return new Response("POST required",{status:405,headers:cors});
      try {
        const body = await request.json();
        const prompt = String(body.prompt || "").trim();
        if (!prompt) return new Response(JSON.stringify({error:"Prompt required"}),{
          status:400,headers:{"Content-Type":"application/json",...cors}
        });

        // Cloudflare Workers AI text-to-image model.
        const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {prompt});

        return new Response(result, {
          headers: {"Content-Type":"image/jpeg", ...cors}
        });
      } catch (e) {
        return new Response(JSON.stringify({
          error:"AI image generation failed",
          detail:String(e)
        }),{
          status:500,headers:{"Content-Type":"application/json",...cors}
        });
      }
    }

    return new Response("DigiRise AI Worker is running. Use POST /generate.",{
      headers: cors
    });
  }
};
