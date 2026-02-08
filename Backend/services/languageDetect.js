import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const detectLanguage = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Detect the language of the following text. Respond ONLY with the 2-letter ISO language code (e.g., 'en', 'es', 'fr').\n\nText: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English on error
  }
};