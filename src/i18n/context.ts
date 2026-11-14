import { createContext, useContext } from "react";
import { mn } from "./mn";
import type { Dict } from "./mn";

// Сонгосон хэлний толь. App.tsx нь <LangContext value={DICTS[lang]}> гэж өгнө.
export const LangContext = createContext<Dict>(mn);

export const useT = (): Dict => useContext(LangContext);
