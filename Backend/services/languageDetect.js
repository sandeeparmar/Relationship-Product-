import 'dotenv/config';

// Simple language detection based on common characters
const detectLanguageByCharacters = (text) => {
  if (!text) return "en";

  // Check for common non-Latin scripts
  const chineseRegex = /[\u4E00-\u9FFF]/g;
  const arabicRegex = /[\u0600-\u06FF]/g;
  const devangariRegex = /[\u0900-\u097F]/g;
  const cyrillicRegex = /[\u0400-\u04FF]/g;

  const chineseCount = (text.match(chineseRegex) || []).length;
  const arabicCount = (text.match(arabicRegex) || []).length;
  const devangariCount = (text.match(devangariRegex) || []).length;
  const cyrillicCount = (text.match(cyrillicRegex) || []).length;

  if (chineseCount > text.length * 0.1) return "zh";
  if (arabicCount > text.length * 0.1) return "ar";
  if (devangariCount > text.length * 0.1) return "hi";
  if (cyrillicCount > text.length * 0.1) return "ru";

  return null;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DETECTION_TIMEOUT = 5000;

export const detectLanguage = async (text, userPreferredLanguage = "en") => {
  try {
    if (!text || text.trim().length === 0) return userPreferredLanguage || "en";

    const charBasedLang = detectLanguageByCharacters(text);
    if (charBasedLang) {
      console.log(`Language detected (character-based): ${charBasedLang}`);
      return charBasedLang;
    }

    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Using preferred language.");
      return userPreferredLanguage || "en";
    }

    const prompt = `Detect the language of the following text and return ONLY its 2-letter ISO 639-1 language code (e.g., "en", "es", "fr", "hi"). Do not return anything else. Text: "${text}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DETECTION_TIMEOUT);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Gemini API Rate Limit Exceeded (429) for detection. Using preferred language.");
      } else {
        console.error("Gemini Detection Error Status: ", response.status);
      }
      return userPreferredLanguage || "en";
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0) {
      let code = result.candidates[0].content.parts[0].text.trim().toLowerCase();
      // Remove any quotes or punctuation Gemini might have added
      code = code.replace(/[^a-z]/g, '');
      if (code.length === 2 || code.length === 3) {
        return code;
      }
    }

    return userPreferredLanguage || "en";
  } catch (error) {
    console.error("Language detection error:", error.message);
    // Use user's preferred language on any error
    return userPreferredLanguage || "en";
  }
};