import OpenAI from "openai";

export const  speechToText = async (audioPath) => {
  
  const openai = new OpenAI({ apiKey : process.env.GEMINI_API_KEY}) ;

  const result = await openai.audio.transcriptions.create({
    file : fs.createReadStream(audioPath) ,
    model : "whisper-1" 
  }) ;
  
  return result.text ;
} ;