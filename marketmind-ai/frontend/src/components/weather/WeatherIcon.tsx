import React from "react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  HelpCircle,
} from "lucide-react";

interface WeatherIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  name,
  size = 24,
  color,
  className,
  style,
}) => {
  const iconProps = { size, color, className, style };

  switch (name) {
    case "Sun":
      return <Sun {...iconProps} color={color || "#f59e0b"} />;
    case "CloudSun":
      return <CloudSun {...iconProps} color={color || "#38bdf8"} />;
    case "Cloud":
      return <Cloud {...iconProps} color={color || "#94a3b8"} />;
    case "CloudRain":
      return <CloudRain {...iconProps} color={color || "#0284c7"} />;
    case "CloudDrizzle":
      return <CloudDrizzle {...iconProps} color={color || "#38bdf8"} />;
    case "CloudLightning":
      return <CloudLightning {...iconProps} color={color || "#8b5cf6"} />;
    case "CloudSnow":
      return <CloudSnow {...iconProps} color={color || "#60a5fa"} />;
    case "CloudFog":
      return <CloudFog {...iconProps} color={color || "#94a3b8"} />;
    case "Wind":
      return <Wind {...iconProps} color={color || "#0ea5e9"} />;
    case "Droplets":
      return <Droplets {...iconProps} color={color || "#0284c7"} />;
    default:
      return <HelpCircle {...iconProps} color={color || "var(--text-muted)"} />;
  }
};
