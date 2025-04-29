import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your API key from environment variable
let api_key = "AIzaSyCjFWoRawc8HYfiBsRA71KlHZRAAR-Czg0";
const genAI = new GoogleGenerativeAI(api_key);

/**
 * Generates content using the Gemini AI model.
 *
 * @param {string} prompt - The prompt to send to the Gemini model.
 * @returns {Promise<string|null>} - The generated text response, or null on error.
 */
async function generateContent(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // console.log(text);
    return text;
  } catch (error) {
    console.error("Error generating content:", error);
    // Improved error handling: Throw the error to be caught by the global error handler
    throw error;
  }
}

export { generateContent };
