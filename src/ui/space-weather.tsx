import type { Flare } from "../game/types";
import type { WeatherStatus } from "../hooks/use-space-weather";

export interface Weather {
  flare: Flare | null;
  status: WeatherStatus;
}

// Өнөөдрийн сансрын цаг агаар: NASA DONKI-оос шууд татсан бодит дэлбэрэлт, эсвэл архив
export function SpaceWeather({ flare, status }: Weather) {
  if (status === "loading") return <p className="rounded-xl bg-panel p-2.5 text-xs text-orange-100/70">🛰️ NASA-аас сансрын цаг агаарын мэдээ татаж байна…</p>;
  if (!flare) return <p className="rounded-xl bg-panel p-2.5 text-xs text-orange-100/70">🛰️ Шууд мэдээ татаж чадсангүй. NASA DONKI-ийн 2024 оны архивын бодит дэлбэрэлтийг ашиглана.</p>;
  return (
    <p className="rounded-xl bg-red-900/50 p-2.5 text-left text-xs">
      🛰️ <b>Өнөөдрийн сансрын цаг агаар · NASA DONKI:</b> сүүлийн 30 хоногт Наран дээр гарсан хамгийн хүчтэй дэлбэрэлт <b>{flare.cls}</b> ({flare.date}). Энэ тоглолтод яг тэр дэлбэрэлт тохионо!
    </p>
  );
}
