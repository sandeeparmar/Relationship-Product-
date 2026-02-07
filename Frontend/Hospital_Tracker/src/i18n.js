import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources:{
    en:{translation:{send:"Send"}},
    hi:{translation:{send:"भेजें"}}
  },
  lng:"en",
  fallbackLng:"en"
});

export default i18n;
