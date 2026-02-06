import OpenAI from "openai"

export const generateSummary = async(conversationText) => {
  const openai = new OpenAI({apiKey : process.env.OPENAI_API_KEY }) ;
  const res = await openai.responses.create({
    model : "gpt-4.1-mini" ,
    input :`Extract : 
    -Symptoms 
    -Diagnosis
    -Medication 
    -Follow-up Actions    
    From Conversation 
    ${conversationText}
    `
  }) ;
  return res.output_text ;
}