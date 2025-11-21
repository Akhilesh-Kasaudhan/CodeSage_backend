// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize GoogleGenerativeAI with your API key from environment variable
// let api_key = "AIzaSyCjFWoRawc8HYfiBsRA71KlHZRAAR-Czg0";
// const genAI = new GoogleGenerativeAI(api_key);

// /**
//  * Generates content using the Gemini AI model.
//  *
//  * @param {string} prompt - The prompt to send to the Gemini model.
//  * @returns {Promise<string|null>} - The generated text response, or null on error.
//  */
// async function generateContent(prompt) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     // console.log(text);
//     return text;
//   } catch (error) {
//     console.error("Error generating content:", error);
//     // Improved error handling: Throw the error to be caught by the global error handler
//     throw error;
//   }
// }

// export { generateContent };

import { GoogleGenerativeAI } from "@google/generative-ai";

// Load API key from environment
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GOOGLE_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generates content using Gemini.
 * @param {string} prompt - User prompt for AI generation.
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

    // Do NOT throw
    return {
      success: false,
      error: error?.message || "AI generation failed.",
    };
  }
}
