import 'dotenv/config';
import fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TRANSLATION_TIMEOUT = 10000;

const translationCache = new Map();

// Simple language code mapping for common languages 
const languageCodeMap = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'pa': 'Punjabi',
  'ur': 'Urdu',
  'ko': 'Korean',
  'th': 'Thai',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'vi': 'Vietnamese'
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

    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Returning original text.");
      return text;
    }

    const sourceLang = languageCodeMap[fromLang] || fromLang;
    const targetLang = languageCodeMap[toLang] || toLang;

    // Construct precise prompt
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. 
Do not include any explanations, do not wrap in markdown, and do not acknowledge this prompt. 
Just return the direct translation.
Text: "${text}"`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT);

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
        console.warn("Gemini API Rate Limit Exceeded (429). Falling back to original text.");
      } else {
        const errText = await response.text();
        console.error("Gemini API Error Status: ", response.status, errText);
      }
      return text;
    }

    const result = await response.json();

    let translation = text;
    if (result.candidates && result.candidates.length > 0) {
      const outputText = result.candidates[0].content.parts[0].text.trim();
      translation = outputText;

      // Remove any surrounding quotes that Gemini might add
      if (translation.startsWith('"') && translation.endsWith('"')) {
        translation = translation.substring(1, translation.length - 1);
      }
    }

    // Cache the result
    translationCache.set(cacheKey, translation);
    return translation;
  } catch (error) {
    console.error("Gemini Translation Error Stringified:", String(error));
    // Silently fail on error to avoid noise
    return text;
  }
};