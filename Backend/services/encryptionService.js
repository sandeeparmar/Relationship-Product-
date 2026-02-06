import crypto from "crypto" ;

const key = Buffer.from(process.env.ENCRYPTION_KEY) ; 

export const encrypt = (text) => {
  const iv= crypto.randomBytes(16) ;
  const cipher = crypto.createCipheriv("aes-256-cbc" , key ,iv)  ;
  let encrypted = cipher.update(text , "utf8" , "hex") ;
  encrypted += cipher.final("hex") ;
  return iv.toString("hex") + ":" + encrypted ;
} ;

export const decrypt = (encrypted) => {
  const [ivHex , data] = encrypted.split(":") ;
  const decipher = crypto.createDecipheriv("aes-256-cbc" , key , Buffer.from(ivHex ,"hex")) ;
  let decrypted = decipher.update(data , "hex" , "utf8") ;
  return decrypted+ decipher.final("utf8") ;
}