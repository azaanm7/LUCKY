import type { Flare } from "../game/types";
import type { WeatherStatus } from "../hooks/use-space-weather";
import { useT } from "../i18n/context";

export interface Weather {
  flare: Flare | null;
  status: WeatherStatus;
}

// Өнөөдрийн сансрын цаг агаар: NASA DONKI-оос шууд татсан бодит дэлбэрэлт, эсвэл архив
export function SpaceWeather({ flare, status }: Weather) {
  const t = useT().start;
  if (status === "loading") return <p className="rounded-xl bg-panel p-2.5 text-xs text-orange-100/70">{t.weatherLoading}</p>;
  if (!flare) return <p className="rounded-xl bg-panel p-2.5 text-xs text-orange-100/70">{t.weatherFailed}</p>;
  return (
    <p className="rounded-xl bg-red-900/50 p-2.5 text-left text-xs">
      🛰️ <b>{t.weatherLabel}</b> {t.weatherLive(flare.cls, flare.date)}
    </p>
  );
}
