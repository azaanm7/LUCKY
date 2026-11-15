import { createContext, useContext } from "react";
import { en } from "./en";
import type { Dict } from "./mn";

// Сонгосон хэлний толь. App.tsx нь <LangContext value={DICTS[lang]}> гэж өгнө.
export const LangContext = createContext<Dict>(en); // анхдагч хэл: англи

export const useT = (): Dict => useContext(LangContext);
