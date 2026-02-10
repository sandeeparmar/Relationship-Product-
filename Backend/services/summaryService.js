import 'dotenv/config';

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL_ID = "facebook/bart-large-cnn";

// Cache for summaries
const summaryCache = new Map();

export const generateSummary = async (conversationText) => {
  try {
    if (!HF_API_KEY) {
      console.warn("HF_API_KEY not set. Returning default summary.");
      return "Summary generation is not available. Please configure HF_API_KEY.";
    }

    // Check cache
    const cacheKey = `summary_${conversationText.substring(0, 50)}`;
    if (summaryCache.has(cacheKey)) {
      console.log("Returning cached summary.");
      return summaryCache.get(cacheKey);
    }

    // BART-large-cnn is optimized for summarization. 
    // We prepending a clear instruction might help, but it's primarily a summarizer.
    // Truncate if too long (approx check, real tokenization is complex)
    const truncatedText = conversationText.length > 3000 ? conversationText.substring(0, 3000) : conversationText;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: truncatedText,
          parameters: {
            min_length: 50,
            max_length: 250,
            do_sample: false
          }
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 503) {
        return "Summary service is currently warming up. Please try again in a moment.";
      }
      throw new Error(`HF API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // Result format: [{ summary_text: "..." }]

    let summary = "Could not generate summary.";
    if (Array.isArray(result) && result.length > 0 && result[0].summary_text) {
      summary = result[0].summary_text;
    } else if (result.error) {
      throw new Error(result.error);
    }

    // Cache the result
    summaryCache.set(cacheKey, summary);
    return summary;
  } catch (error) {
    console.error("Summary generation error:", error.message);
    return "Failed to generate summary. Please try again later.";
  }
};