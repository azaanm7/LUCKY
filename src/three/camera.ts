// Камерын харагдац: "top" = командлагчийн харагдац (дээрээс, бүх суурь харагдана),
// "close" = нам, ойр (сансрын нисэгчийн араас: тэнгэрийн хаяа харагдана, илүү 3D мэдрэмжтэй).
// Камер тоглогчийг тойрч эргэнэ (yaw). Алхах чиглэл дэлгэцтэй тохирч байхын тулд
// оролтыг screenToWorld-оор эргүүлнэ (hooks/use-game-loop.ts).
export type View = "top" | "close";

// [өндөр, тоглогчоос арагш зай, тоглогчийн урд хэдэн метрийг харах]
type Offsets = [number, number, number];
const VIEWS: Record<View, { wide: Offsets; tall: Offsets }> = {
  top: { wide: [13, 17, 3], tall: [20, 17, 1] },
  close: { wide: [6.5, 12.5, 2.5], tall: [9, 13, 4] },
};
export const DEFAULT_VIEW: View = "top";
export const TURN_SPEED = 1.8; // Q / R товч: радиан/секунд
export const DRAG_TURN = 0.006; // чирэх: радиан/пиксел
const KEY = "camera-view";

const load = (): View => {
  try { const v = localStorage.getItem(KEY); return v === "top" || v === "close" ? v : DEFAULT_VIEW; } catch { return DEFAULT_VIEW; }
};
const save = (v: View) => { try { localStorage.setItem(KEY, v); } catch { /* хадгалж чадахгүй бол зүгээр */ } };

// Дэлгэцийн чиглэл (dx = баруун, dz = доош / камер руу) → ертөнцийн чиглэл. yaw = 0 үед өөрчлөгдөхгүй.
export function screenToWorld(dx: number, dz: number, yaw: number): { dx: number; dz: number } {
  const sin = Math.sin(yaw), cos = Math.cos(yaw);
  return { dx: dx * cos + dz * sin, dz: dz * cos - dx * sin };
}

export function createCameraRig() {
  let view = load();
  let yaw = 0, shown = 0; // yaw = зорилт, shown = дэлгэц дээрх (зөөлөн дагана)
  const now: Offsets = [...VIEWS[view].wide];
  let first = true;
  return {
    get yaw() { return shown; },
    get view() { return view; },
    turn(delta: number) { yaw += delta; },
    toggle() { view = view === "top" ? "close" : "top"; save(view); },
    // Frame бүр: зорилт руу зөөлөн шилжинэ. Буцаах нь камерыг тавих утгууд.
    step(dt: number, portrait: boolean) {
      const goal = VIEWS[view][portrait ? "tall" : "wide"];
      const k = first ? 1 : Math.min(1, dt * 5);
      first = false;
      for (let i = 0; i < 3; i++) now[i] += (goal[i] - now[i]) * k;
      shown += (yaw - shown) * Math.min(1, dt * 12);
      return { up: now[0], back: now[1], ahead: now[2], sin: Math.sin(shown), cos: Math.cos(shown) };
    },
  };
}
