import 'dotenv/config';

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL_ID = "facebook/nllb-200-distilled-600M";
const TRANSLATION_TIMEOUT = 5000; 

const translationCache = new Map();

// Simple language code mapping for common languages
const languageCodeMap = {
  'en': 'en',
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'pt': 'pt',
  'ru': 'ru',
  'ja': 'ja',
  'zh': 'zh',
  'ar': 'ar',
  'hi': 'hi',
  'bn': 'bn',
  'pa': 'pa',
  'ur': 'ur',
  'ko': 'ko',
  'th': 'th',
  'tr': 'tr',
  'pl': 'pl',
  'nl': 'nl',
  'vi': 'vi'
};

export const translateText = async (text, fromLang, toLang) => {
  try {
    // Check if source and target are same
    if (fromLang === toLang) return text;

    // Check cache
    const cacheKey = `translate_${text.substring(0, 30)}_${fromLang}_${toLang}`;
    if (translationCache.has(cacheKey)) {
      console.log("Returning cached translation.");
      return translationCache.get(cacheKey);
    }

    // If HF API is not available, return original text
    if (!HF_API_KEY) {
      console.warn("HF_API_KEY not set. Returning original text.");
      return text;
    }

    // Normalize language codes
    const normalizedFromLang = languageCodeMap[fromLang] || fromLang;
    const normalizedToLang = languageCodeMap[toLang] || toLang;

    // Try HF API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: normalizedFromLang,
            tgt_lang: normalizedToLang
          }
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Silently fail for common API issues on free tier
      return text;
    }

    const result = await response.json();

    // Check for API errors in response
    if (result.error) {
      return text;
    }

    // Result format for seq2seq: [{ generated_text: "..." }]
    let translation = text;
    if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
      translation = result[0].generated_text;
    }

    // Cache the result
    translationCache.set(cacheKey, translation);
    return translation;
  } catch (error) {
    // Silently fail on error to avoid noise
    return text;
  }
};