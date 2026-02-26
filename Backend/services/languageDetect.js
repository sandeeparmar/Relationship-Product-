import 'dotenv/config';

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL_ID = "facebook/fasttext-language-identification";
const MODEL_TIMEOUT = 10000; // 10 seconds timeout

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

  return null; // Could not detect from characters
};

export const detectLanguage = async (text, userPreferredLanguage = "en") => {
  try {
    if (!text || text.trim().length === 0) return userPreferredLanguage || "en";

    // First try character-based detection (fast and reliable)
    const charBasedLang = detectLanguageByCharacters(text);
    if (charBasedLang) {
      console.log(`Language detected (character-based): ${charBasedLang}`);
      return charBasedLang;
    }

    // If HF API is not available, use user's preferred language
    if (!HF_API_KEY) {
      console.warn("HF_API_KEY not set. Using user's preferred language or defaulting to 'en'.");
      return userPreferredLanguage || "en";
    }

    // Try HF API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle specific error codes gracefully
      if (response.status === 410) {
        console.info("HF Model (410 Gone) - API endpoint unavailable. Falling back to user preferred language/en.");
        return userPreferredLanguage || "en";
      }
      if (response.status === 503) {
        console.warn("HF Model loading (503). Using user's preferred language.");
        return userPreferredLanguage || "en";
      }
      if (response.status === 429) {
        console.warn("HF API rate limited (429). Using user's preferred language.");
        return userPreferredLanguage || "en";
      }
      throw new Error(`HF API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      const topResult = result[0][0];
      return topResult.label || userPreferredLanguage || "en";
    } else if (Array.isArray(result) && result.length > 0 && result[0].label) {
      return result[0].label || userPreferredLanguage || "en";
    }

    return userPreferredLanguage || "en";
  } catch (error) {
    console.error("Language detection error:", error.message);
    // Use user's preferred language on any error
    return userPreferredLanguage || "en";
  }
};