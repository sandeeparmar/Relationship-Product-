import OpenAi from "openai" ;
import 'dotenv/config';
const client = new OpenAi({
  apiKey : process.env.OPENAI_API_KEY
}) ;

export const translateText = async (text , fromLang , toLang) => {
  const res = await client.responses.create({
     model :"gpt-4.1-mini" ,
     imput : `Translate to ${toLang} : ${text}` 
  }) ;
  return res.output_text;
} ;