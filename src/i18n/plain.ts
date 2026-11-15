// Бичвэр доторх эможи дүрсийг хасна. Дүрсийг пиксел зургаар (ui/pix.tsx) тусад нь харуулдаг.
const EMOJI = /(?:\p{Extended_Pictographic}|\u{FE0F}|\u{200D}|\u{20E3})+\s*/gu;

export const plain = (text: string): string => text.replace(EMOJI, "").trim();
