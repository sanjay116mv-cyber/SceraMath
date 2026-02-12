import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_INSTRUCTION = `You are SceraMath, a premium mathematical reasoning engine.
Your goal is to provide clear, textbook-quality solutions that are easy to understand.

OUTPUT GUIDELINES:
1. PROBLEM SUMMARY: Restate the problem clearly in one sentence.
2. STEP-BY-STEP DERIVATION:
   - Break the logic into small, digestible steps.
   - Use 'title' for the action being taken.
   - Use 'description' to explain the mathematical intuition.
   - Use 'latex' for the formal mathematical expression.
3. FINAL ANSWER: Provide the definitive result clearly.
4. CONCEPT EXPLANATION: Briefly explain the underlying theorem or property used.

MATHEMATICAL NOTATION RULES:
- Use standard LaTeX for formulas (e.g., \\frac{a}{b}, x^2, \\sqrt{y}).
- In the JSON response, escape backslashes once (e.g., "\\\\frac").
- IMPORTANT: If a formula is simple, keep it simple.
- DO NOT use markdown code blocks or triple backticks. Return ONLY raw JSON.`;

interface RequestBody {
  prompt: string;
  image?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, image }: RequestBody = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const contents: any[] = [];
    if (image) {
      contents.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(",")[1] || image,
        },
      });
    }
    contents.push({ text: prompt });

    const requestBody = {
      contents: [{
        parts: contents,
      }],
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            problemSummary: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  latex: { type: "string" },
                },
                required: ["title", "description", "latex"],
              },
            },
            finalAnswer: { type: "string" },
            conceptExplanation: { type: "string" },
            relatedFormulas: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "problemSummary",
            "steps",
            "finalAnswer",
            "conceptExplanation",
            "relatedFormulas",
          ],
        },
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to process math problem" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanedJson = text.replace(/^[^{]*|[^}]*$/g, "").trim();
    const solution = JSON.parse(cleanedJson);

    return new Response(JSON.stringify(solution), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in solve-math function:", error);
    return new Response(
      JSON.stringify({
        error: "The logic engine failed to synthesize a response",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
