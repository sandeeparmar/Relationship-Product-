import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const translateText = async (text, fromLang, toLang) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Translate the following text to ${toLang}. Return ONLY the translated text, no other commentary.\n\nText: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
};