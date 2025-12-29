
import { GoogleGenAI, Type } from "@google/genai";
import { MathSolution } from "../types";

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

export const solveMathProblem = async (
  prompt: string,
  image?: string
): Promise<MathSolution> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const contents: any[] = [];
  if (image) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: image.split(',')[1],
      },
    });
  }
  contents.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: contents },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemSummary: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                latex: { type: Type.STRING },
              },
              required: ["title", "description", "latex"]
            }
          },
          finalAnswer: { type: Type.STRING },
          conceptExplanation: { type: Type.STRING },
          relatedFormulas: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["problemSummary", "steps", "finalAnswer", "conceptExplanation", "relatedFormulas"]
      }
    }
  });

  try {
    const text = response.text || "";
    // Robust cleaning for any potential wrapper leakage
    const cleanedJson = text.replace(/^[^{]*|[^}]*$/g, '').trim();
    return JSON.parse(cleanedJson) as MathSolution;
  } catch (error) {
    console.error("Logic Engine Failure:", error);
    throw new Error("The logic engine failed to synthesize a response. Please try a different query.");
  }
};
