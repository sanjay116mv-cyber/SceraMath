
import { MathSolution } from "../types";

export const solveMathProblem = async (
  prompt: string,
  image?: string
): Promise<MathSolution> => {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solve-math`;

  const headers = {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt, image }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const solution = await response.json();
    return solution as MathSolution;
  } catch (error) {
    console.error("Logic Engine Failure:", error);
    throw new Error("The logic engine failed to synthesize a response. Please try a different query.");
  }
};
