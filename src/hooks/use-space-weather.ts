import { useEffect, useState } from "react";
import { DONKI_FLARES, strongest } from "../game/donki";
import type { Flare } from "../game/types";

const DAYS = 30; // сүүлийн хэдэн хоногийн бүртгэлийг татах
const TIMEOUT_MS = 7000;
const day = (d: Date) => d.toISOString().slice(0, 10);

export type WeatherStatus = "loading" | "live" | "archive";

// Сүүлийн 30 хоногийн нарны дэлбэрэлтийг NASA DONKI-оос шууд татаж, хамгийн хүчтэйг нь буцаана.
// Интернетгүй эсвэл удаан бол flare = null хэвээр үлдэж, тоглоом архивын бүртгэлээ хэрэглэнэ.
export function useSpaceWeather() {
  const [flare, setFlare] = useState<Flare | null>(null);
  const [status, setStatus] = useState<WeatherStatus>("loading");

  useEffect(() => {
    const control = new AbortController();
    const timer = setTimeout(() => control.abort(), TIMEOUT_MS);
    const url = `${DONKI_FLARES}?startDate=${day(new Date(Date.now() - DAYS * 864e5))}&endDate=${day(new Date())}`;
    fetch(url, { signal: control.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const found = strongest(data);
        setFlare(found);
        setStatus(found ? "live" : "archive");
      })
      .catch(() => setStatus("archive"))
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); control.abort(); };
  }, []);

  return { flare, status };
}
