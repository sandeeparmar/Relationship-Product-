import "dotenv/config";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUMMARY_TIMEOUT = 15000;

const summaryCache = new Map();

export const generateSummary = async (conversationText) => {
  try {
    if (!conversationText || !conversationText.trim()) {
      return "No conversation content available to summarize.";
    }

    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Returning default summary.");
      return "AI summary is not available. Please configure GEMINI_API_KEY.";
    }

    // Cache key based on first 100 chars
    const cacheKey = `summary_${conversationText.substring(0, 100)}`;
    if (summaryCache.has(cacheKey)) {
      console.log("Returning cached Gemini summary.");
      return summaryCache.get(cacheKey);
    }

    const truncatedText =
      conversationText.length > 4000
        ? conversationText.substring(0, 4000)
        : conversationText;

    const prompt = `
You are a clinical assistant. Read the following doctor–patient conversation and produce a concise, patient-friendly health summary.

Focus on:
- Main complaints and symptoms
- Key findings or diagnoses (if any)
- Important medications, tests, or follow-ups

Use clear, simple language (no more than 1–2 short paragraphs). Do not include any extra commentary or disclaimers.

Conversation:
${truncatedText}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 256,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(
          "Gemini API Rate Limit Exceeded (429) for summary. Returning fallback message."
        );
        return "Summary service is temporarily busy. Please try again in a moment.";
      }
      const errText = await response.text();
      console.error(
        "Gemini Summary Error Status: ",
        response.status,
        errText
      );
      return "Failed to generate summary. Please try again later.";
    }

    const result = await response.json();

    let summary =
      "Could not generate summary. Please try again later.";

    if (result.candidates && result.candidates.length > 0) {
      const text =
        result.candidates[0].content?.parts?.[0]?.text?.trim();
      if (text) {
        summary = text;
        // Strip surrounding quotes if present
        if (summary.startsWith('"') && summary.endsWith('"')) {
          summary = summary.substring(1, summary.length - 1);
        }
      }
    }

    summaryCache.set(cacheKey, summary);
    return summary;
  } catch (error) {
    console.error("Gemini summary generation error:", String(error));
    return "Failed to generate summary. Please try again later.";
  }
};