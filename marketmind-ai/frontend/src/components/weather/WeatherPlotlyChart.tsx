import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

export interface WeatherPlotlyChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layout?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
}

export const WeatherPlotlyChart: React.FC<WeatherPlotlyChartProps> = ({
  data,
  layout,
  config,
  style,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseLayout: Record<string, any> = {
      autosize: true,
      margin: { l: 45, r: 25, t: 35, b: 40 },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      font: {
        family: "Inter, system-ui, sans-serif",
        color: "#475569",
        size: 11,
      },
      hoverlabel: {
        bgcolor: "#0f172a",
        bordercolor: "#38bdf8",
        font: { family: "Inter, sans-serif", color: "#ffffff", size: 12 },
      },
      ...layout,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseConfig: Record<string, any> = {
      responsive: true,
      displayModeBar: "hover",
      displaylogo: false,
      modeBarButtonsToRemove: [
        "lasso2d",
        "select2d",
        "hoverClosestCartesian",
        "hoverCompareCartesian",
      ],
      ...config,
    };

    Plotly.react(container, data, baseLayout as unknown as Plotly.Layout, baseConfig as unknown as Plotly.Config);

    const resizeObserver = new ResizeObserver(() => {
      if (container) {
        Plotly.Plots.resize(container);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (container) {
        Plotly.purge(container);
      }
    };
  }, [data, layout, config]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        minHeight: 280,
        position: "relative",
        ...style,
      }}
    />
  );
};

