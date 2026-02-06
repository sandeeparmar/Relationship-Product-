import OpenAI from "openai";

export const detectLanguage = async (text) => {
  const openai = new OpenAI({ apiKey : process.env.OPENAI_API_KEY}) ;

  const res = await openai.responses.create({
    model :'gpt-4.1-mini' ,
   input : `Detect Language of this text : ${text}`
  }) ;
  return res.output_text.trim() ;
} ;