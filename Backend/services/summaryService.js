import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSummary = async (conversationText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a medical assistant. Analyze the following conversation and extract:
    - Symptoms
    - Diagnosis
    - Medication
    - Follow-up Actions
    
    Conversation:
    ${conversationText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Failed to generate summary.";
  }
};