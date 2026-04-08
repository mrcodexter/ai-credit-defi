import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CreditScoreResult {
  score: number;
  reason: string;
  limit: number;
}

export async function generateCreditScore(address: string): Promise<CreditScoreResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following Ethereum wallet address and generate a mock credit score (0-100) based on perceived "on-chain activity" (this is for a hackathon demo). 
      Address: ${address}
      
      Return a JSON object with:
      - score: number (0-100)
      - reason: string (a short professional explanation)
      - limit: number (max loan amount in HSK, roughly score * 0.01)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            limit: { type: Type.NUMBER },
          },
          required: ["score", "reason", "limit"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score || 0,
      reason: result.reason || "No data found.",
      limit: result.limit || 0,
    };
  } catch (error) {
    console.error("AI Credit Score Error:", error);
    // Fallback mock data if AI fails or key is missing
    const mockScore = Math.floor(Math.random() * 50) + 50;
    return {
      score: mockScore,
      reason: "Mock analysis performed due to service unavailability.",
      limit: mockScore * 0.01,
    };
  }
}
