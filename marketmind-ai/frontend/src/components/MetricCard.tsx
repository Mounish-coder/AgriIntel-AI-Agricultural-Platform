interface Props {
  label: string;
  value: string | number | null;
  sub?: string;
  accent?: "blue" | "green" | "yellow" | "red" | "purple";
  icon?: React.ReactNode;
}

const accentColors = {
  blue: "var(--accent)",
  green: "var(--accent-3)",
  yellow: "var(--accent-warn)",
  red: "var(--accent-danger)",
  purple: "var(--accent-2)",
};

export function MetricCard({ label, value, sub, accent = "blue", icon }: Props) {
  const color = accentColors[accent];
  return (
    <div className="metric-card fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label">{label}</span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <div className="value" style={{ color }}>
        {value ?? "—"}
      </div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
