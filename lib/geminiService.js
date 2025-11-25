import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBOWPC20ZcF3ke2Mz6cyjwW3CJT6wNSNfM";

if (!apiKey) {
  console.error(" GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates content using Gemini.
 * @param {string} prompt
 * @returns {Promise<{ success: boolean, data?: string, error?: string }>}
 */
export async function generateContent(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      return {
        success: false,
        error: "Prompt must be a non-empty string.",
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);

    const response = result?.response;
    const text = response?.text ? response.text() : null;

    if (!text) {
      return {
        success: false,
        error: "No response text returned by Gemini.",
      };
    }

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error("❌ Gemini Error:", error?.message || error);

    return {
      success: false,
      error: error?.message || "AI generation failed.",
    };
  }
}
