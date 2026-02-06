export const translateText = async (text , fromLang , toLang) => {
  if(fromLang == toLang)return text ;
  const translated = `Translated(${toLang}) : ${text} `
  return translated ;
} ;