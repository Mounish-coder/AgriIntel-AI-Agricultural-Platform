import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { OverviewPage } from "./pages/OverviewPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { ForecastPage } from "./pages/ForecastPage";
import { ResultsPage } from "./pages/ResultsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { getHistory, getAgmarknetStatus } from "./services/api";

const WeatherPage = lazy(() =>
  import("./pages/WeatherPage").then((m) => ({ default: m.WeatherPage }))
);
const FarmerAdvisoryPage = lazy(() =>
  import("./pages/FarmerAdvisoryPage").then((m) => ({ default: m.FarmerAdvisoryPage }))
);
import type { ForecastRunResponse, AgmarknetStatus } from "./types";
import { Database, Sprout, CheckCircle2, AlertCircle } from "lucide-react";

function App() {
  const [agmarknetStatus, setAgmarknetStatus] = useState<AgmarknetStatus | null>(null);
  const [lastRun, setLastRun] = useState<ForecastRunResponse | null>(null);

  useEffect(() => {
    getAgmarknetStatus()
      .then(st => setAgmarknetStatus(st))
      .catch(err => console.error("Error loading AGMARKNET status:", err));

    getHistory()
      .then(history => {
        const completed = history.find(h => h.status === "COMPLETED");
        if (completed) setLastRun(completed);
      })
      .catch(err => console.error("Error loading history:", err));
  }, []);

  const meta = agmarknetStatus?.metadata;
  const isReady = agmarknetStatus?.status === "ready";

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {/* Header */}
          <header style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.5rem",
            background: "var(--bg-card)",
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 1px 4px rgba(0,40,80,0.05)",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>
                <Sprout size={18} />
                <span>AgriIntel</span>
              </div>
              <span style={{ color: "var(--border)" }}>|</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Database size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Dataset:</span>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 600,
                  color: isReady ? "#047857" : "var(--text-secondary)",
                  background: isReady ? "rgba(5,150,105,0.1)" : "rgba(0,0,0,0.04)",
                  padding: "0.15rem 0.5rem", borderRadius: 6,
                  border: `1px solid ${isReady ? "rgba(5,150,105,0.25)" : "var(--border-subtle)"}`,
                }}>
                  {meta?.filename || (agmarknetStatus?.status === "error" ? "Not loaded" : "Loading…")}
                  {meta?.total_records && (
                    <span style={{ color: "var(--text-secondary)", fontWeight: 400, marginLeft: 5 }}>
                      {meta.total_records.toLocaleString()} rows · {meta.states_count} States · {meta.crops_count} Crops
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem" }}>
              {isReady ? (
                <>
                  <CheckCircle2 size={14} style={{ color: "#059669" }} />
                  <span style={{ color: "#059669", fontWeight: 600 }}>AGMARKNET Ready</span>
                </>
              ) : agmarknetStatus?.status === "error" ? (
                <>
                  <AlertCircle size={14} style={{ color: "var(--accent-danger)" }} />
                  <span style={{ color: "var(--accent-danger)", fontWeight: 600 }}>Dataset Error</span>
                </>
              ) : (
                <>
                  <div className="spinner" style={{ width: 12, height: 12 }} />
                  <span style={{ color: "var(--text-muted)" }}>Loading dataset…</span>
                </>
              )}
            </div>
          </header>

          <Routes>
            <Route path="/" element={<OverviewPage agmarknetStatus={agmarknetStatus} lastRun={lastRun} />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/forecast" element={
              <ForecastPage
                onRunComplete={run => setLastRun(run)}
              />
            } />
            <Route path="/results" element={<ResultsPage lastRun={lastRun} />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/advisory" element={
              <Suspense fallback={
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                  <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 1rem" }} />
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Loading Farmer Advisory...</div>
                </div>
              }>
                <FarmerAdvisoryPage />
              </Suspense>
            } />
            <Route path="/weather" element={
              <Suspense fallback={
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                  <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 1rem" }} />
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Loading Weather Module...</div>
                </div>
              }>
                <WeatherPage />
              </Suspense>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
