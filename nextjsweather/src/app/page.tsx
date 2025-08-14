// File: app/page.tsx

"use client";
import { useMemo, useState } from "react";
// import InteractiveMap from "./Component/interactiveMap";
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('./Component/interactiveMap'), { ssr: false });

type ConditionKey = "rain" | "wind" | "temp" | "uv" | "humidity";

type Forecast = {
  date: string; // YYYY-MM-DD
  rain_mm: number;
  wind_kmh: number;
  temp_max: number;
  uv_index: number;
  humidity: number;
};

type Task = {
  id: string;
  name: string;
  start: string; // date
  end: string;   // date
  requires: ConditionKey[]; // conditions that matter
};

// --- Sample demo data (replace with API later) ------------------
const demoForecast: Forecast[] = [
  { date: "2025-08-13", rain_mm: 0.2, wind_kmh: 18, temp_max: 26, uv_index: 2, humidity: 58 },
  { date: "2025-08-14", rain_mm: 5.8, wind_kmh: 32, temp_max: 14, uv_index: 3, humidity: 71 },
  { date: "2025-08-15", rain_mm: 1.0, wind_kmh: 22, temp_max: 17, uv_index: 4, humidity: 60 },
  { date: "2025-08-16", rain_mm: 9.6, wind_kmh: 41, temp_max: 12, uv_index: 1, humidity: 76 },
  { date: "2025-08-17", rain_mm: 0.0, wind_kmh: 15, temp_max: 18, uv_index: 4, humidity: 55 },
  { date: "2025-08-18", rain_mm: 2.4, wind_kmh: 28, temp_max: 19, uv_index: 5, humidity: 57 },
  { date: "2025-08-19", rain_mm: 0.0, wind_kmh: 12, temp_max: 20, uv_index: 5, humidity: 49 },
];

const demoTasks: Task[] = [
  { id: "t1", name: "Pour slab – Zone A", start: "2025-08-14", end: "2025-08-15", requires: ["rain", "temp"] },
  { id: "t2", name: "Crane lift – HVAC units", start: "2025-08-16", end: "2025-08-16", requires: ["wind"] },
  { id: "t3", name: "External paint – East wall", start: "2025-08-18", end: "2025-08-19", requires: ["rain", "temp", "humidity"] },
];

export default function Page() {
  // --- Filters / thresholds ------------------------------------------------
  const [location, setLocation] = useState("Melbourne, VIC");
  const [selectedConditions, setSelectedConditions] = useState<ConditionKey[]>(["rain", "wind", "temp"]);
  const [rainMax, setRainMax] = useState(2); // mm
  const [windMax, setWindMax] = useState(35); // km/h
  const [tempMin, setTempMin] = useState(10); // °C

  const dates = useMemo(() => demoForecast.map(f => f.date), []);

  // Risk scoring per day based on thresholds and selected conditions
  const riskByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of demoForecast) {
      let risk = 0;
      if (selectedConditions.includes("rain")) risk += f.rain_mm > rainMax ? 1 : 0;
      if (selectedConditions.includes("wind")) risk += f.wind_kmh > windMax ? 1 : 0;
      if (selectedConditions.includes("temp")) risk += f.temp_max < tempMin ? 1 : 0;
      map[f.date] = risk; // 0=ok, 1–3 increasing risk
    }
    return map;
  }, [selectedConditions, rainMax, windMax, tempMin]);

  // Which tasks are at risk by their windows
  const taskAlerts = useMemo(() => {
    return demoTasks.map(task => {
      const window = dateRange(task.start, task.end);
      const worst = Math.max(...window.map(d => riskByDate[d] ?? 0));
      return { task, risk: worst };
    });
  }, [riskByDate]);





  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div>
<h1 className="text-3xl font-bold text-center">WeatherActiV</h1>
        <h1 className="mb-6 text-3xl font-bold">WeatherActiV Dashboard</h1>
          <p className="text-center font-bold text-green-500">
 chicken jockey
</p>
      </div>

      {/* Top summary cards */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {demoForecast.slice(0,4).map((f) => (
          <div key={f.date} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-700">{formatDate(f.date)}</h3>
              <span className={chipClass(riskByDate[f.date])}>{riskLabel(riskByDate[f.date])}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 text-sm">
              <Metric label="Rain" value={`${f.rain_mm.toFixed(1)} mm`} />
              <Metric label="Wind" value={`${f.wind_kmh} km/h`} />
              <Metric label="Max" value={`${f.temp_max}°C`} />
            </div>
          </div>
        ))}
      </section>

      {/* Main layout */}
      <section className="flex justify-center">
        {/* Left: Risk timeline & forecast table */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm mx-auto">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">7‑day risk timeline</h2>
              <Legend />
            </div>
            <Timeline dates={dates} riskByDate={riskByDate} />
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Forecast details</h2>
            <table className="w-full table-auto border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="px-2">Date</th>
                  <th className="px-2">Rain (mm)</th>
                  <th className="px-2">Wind (km/h)</th>
                  <th className="px-2">Max °C</th>
                  <th className="px-2">UV</th>
                  <th className="px-2">RH %</th>
                  <th className="px-2">Risk</th>
                </tr>
              </thead>
              <tbody className="text-neutral-800">
                {demoForecast.map((f) => (
                  <tr key={f.date} className="rounded-xl bg-neutral-50">
                    <td className="px-2 py-2 font-medium">{formatDate(f.date)}</td>
                    <td className="px-2">{f.rain_mm.toFixed(1)}</td>
                    <td className="px-2">{f.wind_kmh}</td>
                    <td className="px-2">{f.temp_max}</td>
                    <td className="px-2">{f.uv_index}</td>
                    <td className="px-2">{f.humidity}</td>
                    <td className="px-2">{riskLabel(riskByDate[f.date])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
                 {/* Site map inside forecast details */}
  <div className="mt-0 rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
    <div className="px-4 pt-4 pb-2 flex items-center justify-between">
      <h2 className="text-base font-semibold">Site map</h2>
      <span className="text-xs text-neutral-600">{location}</span>
    </div>
    <div className="h-[420px]">
      <InteractiveMap
        apikey={process.env.NEXT_PUBLIC_HERE_API_KEY!}
        center={{ lat: -37.8136, lng: 144.9631 }}
        zoom={11}
        className="h-full w-full"
      />
    </div>
</div>
          </div>
        </div>

      



        {/* Right: Thresholds & Alerts */}
        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Thresholds</h2>
            <div className="space-y-4 text-sm">
              <ToggleChip
                label="Rain"
                checked={selectedConditions.includes("rain")}
                onChange={() => toggle(selectedConditions, setSelectedConditions, "rain")}
              />
              <RangeControl label={`Max rain (mm) ≤ ${rainMax}`} value={rainMax} min={0} max={20} onChange={setRainMax} />

              <ToggleChip
                label="Wind"
                checked={selectedConditions.includes("wind")}
                onChange={() => toggle(selectedConditions, setSelectedConditions, "wind")}
              />
              <RangeControl label={`Max wind (km/h) ≤ ${windMax}`} value={windMax} min={0} max={80} onChange={setWindMax} />

              <ToggleChip
                label="Temperature"
                checked={selectedConditions.includes("temp")}
                onChange={() => toggle(selectedConditions, setSelectedConditions, "temp")}
              />
              <RangeControl label={`Min max‑temp (°C) ≥ ${tempMin}`} value={tempMin} min={0} max={40} onChange={setTempMin} />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Alerts (by task)</h2>
            <ul className="space-y-2 text-sm">
              {taskAlerts.map(({ task, risk }) => (
                <li key={task.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-neutral-600">{formatDate(task.start)} → {formatDate(task.end)}</p>
                    </div>
                    <span className={chipClass(risk)}>{riskLabel(risk)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.requires.map(r => (
                      <span key={r} className="rounded-md bg-white px-2 py-0.5 text-xs text-neutral-700 ring-1 ring-neutral-200">
                        {pretty(r)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>


      {/* Footer note / mockup image slot */}
      <section className="mt-8 rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-4">
        <p className="text-sm text-neutral-600">
          This layout mirrors the supplied mockup. Replace sample data with your BoM/ABS feeds.
          If you want a visual reference in the app, drop your mockup image into <code>/public/mockup.png</code> and add an
          <code> &lt;Image /&gt;</code> here.
        </p>
      </section>
    </main>
  );
}

// ---------------- Components & helpers ----------------
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-600">
      <span className="inline-block size-2 rounded-sm bg-emerald-500" /> Low
      <span className="inline-block size-2 rounded-sm bg-amber-500" /> Medium
      <span className="inline-block size-2 rounded-sm bg-rose-500" /> High
    </div>
  );
}

function Timeline({ dates, riskByDate }: { dates: string[]; riskByDate: Record<string, number> }) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {dates.map((d) => (
        <div key={d} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-2 text-xs text-neutral-600">{formatDate(d)}</div>
          <div className="flex h-16 items-end gap-1">
            {/* Three stacked bars to indicate risk channels (rain/wind/temp). Fill proportionally */}
            <div className="h-12 w-full rounded bg-emerald-500" style={{ opacity: riskByDate[d] === 0 ? 1 : 0.3 }} />
            <div className="h-12 w-full rounded bg-amber-500" style={{ opacity: riskByDate[d] >= 1 ? 1 : 0.3 }} />
            <div className="h-12 w-full rounded bg-rose-500" style={{ opacity: riskByDate[d] >= 2 ? 1 : 0.3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ToggleChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`inline-flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm shadow-sm transition ${
        checked
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
      }`}
      aria-pressed={checked}
    >
      <span>{label}</span>
      <span className={`size-5 rounded-full ${checked ? "bg-blue-600" : "bg-neutral-300"}`} />
    </button>
  );
}

function RangeControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-600">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

function chipClass(risk?: number) {
  switch (risk) {
    case 0:
      return "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700";
    case 1:
      return "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700";
    default:
      return "rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700";
  }
}

function riskLabel(risk?: number) {
  if (risk === 0) return "Low";
  if (risk === 1) return "Med";
  return "High";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function pretty(k: ConditionKey) {
  switch (k) {
    case "rain":
      return "Rain";
    case "wind":
      return "Wind";
    case "temp":
      return "Temperature";
    case "uv":
      return "UV";
    case "humidity":
      return "Humidity";
  }
}

function dateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
