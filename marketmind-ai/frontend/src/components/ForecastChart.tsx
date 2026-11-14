import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { ForecastPoint } from "../types";

interface Props {
  historical: ForecastPoint[];
  results: {
    model_name: string;
    test_predictions: ForecastPoint[];
    future_predictions: ForecastPoint[];
  }[];
  selectedModels: string[];
  targetColumn: string;
  showCI?: boolean;
}

// Palette for multiple models
const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#06b6d4", "#f97316", "#ec4899",
];

function fmt(v: unknown) {
  if (v == null) return "";
  const n = Number(v);
  return isNaN(n) ? "" : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function ForecastChart({ historical, results, selectedModels, targetColumn, showCI = true }: Props) {
  // Merge historical + test + future into one dataset keyed by date
  const dateMap = new Map<string, Record<string, number | null>>();

  for (const p of historical) {
    if (!dateMap.has(p.date)) dateMap.set(p.date, {});
    dateMap.get(p.date)!["actual"] = p.value;
  }

  let splitDate: string | null = null;

  for (const r of results) {
    if (!selectedModels.includes(r.model_name)) continue;
    const key = r.model_name;

    for (const p of r.test_predictions) {
      if (!dateMap.has(p.date)) dateMap.set(p.date, {});
      dateMap.get(p.date)![key] = p.value;
      if (!splitDate || p.date < splitDate) splitDate = p.date;
    }

    for (const p of r.future_predictions) {
      if (!dateMap.has(p.date)) dateMap.set(p.date, {});
      dateMap.get(p.date)![key] = p.value;
      dateMap.get(p.date)![`${key}_lo`] = p.lower;
      dateMap.get(p.date)![`${key}_hi`] = p.upper;
    }
  }

  const data = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));

  // Downsample for performance — preserve all test & future forecast points intact,
  // downsample only older historical data if total length exceeds limit.
  const downsample = (arr: typeof data, n: number) => {
    if (arr.length <= n) return arr;
    const forecastStartIdx = splitDate
      ? arr.findIndex(p => p.date >= splitDate)
      : Math.max(0, arr.length - 45);

    if (forecastStartIdx <= 0) return arr;

    const historicalSlice = arr.slice(0, forecastStartIdx);
    const forecastSlice = arr.slice(forecastStartIdx);

    const histTarget = Math.max(50, n - forecastSlice.length);
    if (historicalSlice.length <= histTarget) return arr;

    const step = Math.ceil(historicalSlice.length / histTarget);
    const downsampledHist = historicalSlice.filter((_, i) => i % step === 0);

    return [...downsampledHist, ...forecastSlice];
  };

  const chartData = downsample(data, 500);

  const activeModels = results.filter(r => selectedModels.includes(r.model_name));

  return (
    <div className="chart-container">
      <div style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9rem" }}>
        {targetColumn} — Historical & Forecast
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 24, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 8, fontSize: "0.8rem", color: "var(--text-primary)",
            }}
            formatter={(v: any, name: any) => [fmt(v), String(name ?? "")]}
            labelStyle={{ color: "var(--text-secondary)", marginBottom: 4 }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.78rem", color: "var(--text-secondary)", paddingTop: 8 }}
          />

          {/* Historical actual */}
          <Line
            dataKey="actual"
            name="Actual"
            stroke="var(--text-secondary)"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />

          {/* Per-model predictions */}
          {activeModels.map((r, idx) => {
            const color = COLORS[idx % COLORS.length];
            const key = r.model_name;
            return [
              showCI && (
                <Area
                  key={`${key}_ci`}
                  dataKey={`${key}_hi`}
                  stroke="none"
                  fill={color}
                  fillOpacity={0.1}
                  name={`${key} CI`}
                  legendType="none"
                  dot={false}
                  connectNulls
                />
              ),
              <Line
                key={key}
                dataKey={key}
                name={r.model_name}
                stroke={color}
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray={r.future_predictions.length ? undefined : undefined}
              />,
            ];
          })}

          {/* Forecast start line */}
          {splitDate && (
            <ReferenceLine
              x={splitDate}
              stroke="var(--accent)"
              strokeDasharray="4 4"
              label={{ value: "Forecast →", position: "insideTopRight",
                fontSize: 10, fill: "var(--accent)" }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
