import React, { useState, useEffect, useRef } from "react";
import type { GeoLocation } from "../../types/weather";
import {
  searchLocations,
  getCurrentGpsCoordinates,
  reverseGeocodeCoordinates,
  DEFAULT_LOCATIONS,
  saveLastSelectedLocation,
} from "../../services/geocodingApi";
import { validateCoordinates } from "../../services/weatherApi";
import {
  Search,
  MapPin,
  Crosshair,
  Sliders,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Compass,
} from "lucide-react";

interface LocationSearchBarProps {
  currentLocation: GeoLocation;
  onLocationSelect: (loc: GeoLocation) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isCached?: boolean;
  lastUpdated?: string;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  currentLocation,
  onLocationSelect,
  onRefresh,
  isLoading,
  isCached,
  lastUpdated,
}) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Manual coordinates dialog state
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState(currentLocation.latitude.toString());
  const [manualLon, setManualLon] = useState(currentLocation.longitude.toString());
  const [manualName, setManualName] = useState(currentLocation.name);
  const [manualError, setManualError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(query);
        setSearchResults(results);
        setIsDropdownOpen(true);
      } catch (err: unknown) {
        console.warn("Geocoding search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: GeoLocation) => {
    saveLastSelectedLocation(loc);
    onLocationSelect(loc);
    setQuery("");
    setIsDropdownOpen(false);
    setGpsError(null);
  };

  const handleGpsDetect = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentGpsCoordinates();
      const resolvedLoc = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      handleSelectLocation(resolvedLoc);
    } catch (err: unknown) {
      setGpsError(err instanceof Error ? err.message : "Failed to detect current GPS location.");
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const latNum = parseFloat(manualLat.trim());
    const lonNum = parseFloat(manualLon.trim());

    const validation = validateCoordinates(latNum, lonNum);
    if (!validation.valid) {
      setManualError(validation.error || "Invalid coordinates.");
      return;
    }

    const customLoc: GeoLocation = {
      name: manualName.trim() || `Location (${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°)`,
      latitude: Number(latNum.toFixed(4)),
      longitude: Number(lonNum.toFixed(4)),
      admin1: "Manual Coordinates",
      country: "Custom",
    };

    handleSelectLocation(customLoc);
    setShowManualCoords(false);
  };

  const formatCoordDisplay = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Top Search & Actions Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search input with autocomplete */}
        <div
          ref={searchContainerRef}
          style={{
            position: "relative",
            flex: "1 1 300px",
            minWidth: 260,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.45rem 0.85rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              gap: "0.5rem",
            }}
          >
            <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search city, district, town, or village..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                width: "100%",
                fontSize: "0.9rem",
                color: "var(--text-primary)",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchResults([]);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 2,
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            )}
            {isSearching && (
              <div
                className="spinner"
                style={{ width: 14, height: 14, flexShrink: 0 }}
              />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "105%",
                left: 0,
                right: 0,
                zIndex: 50,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Matching Locations
              </div>
              {searchResults.map((loc, idx) => (
                <div
                  key={`${loc.id || idx}-${loc.latitude}-${loc.longitude}`}
                  onClick={() => handleSelectLocation(loc)}
                  style={{
                    padding: "0.6rem 0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-elevated)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MapPin size={15} style={{ color: "var(--accent)" }} />
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {loc.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {[loc.admin2, loc.admin1, loc.country].filter(Boolean).join(", ")}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
                    {formatCoordDisplay(loc.latitude, loc.longitude)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDropdownOpen && !isSearching && query.trim().length >= 2 && searchResults.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "105%",
                left: 0,
                right: 0,
                zIndex: 50,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                padding: "1rem",
                textAlign: "center",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              No locations found matching &quot;{query}&quot;. Try another city or enter coordinates manually.
            </div>
          )}
        </div>

        {/* GPS Location Button */}
        <button
          type="button"
          onClick={handleGpsDetect}
          disabled={isGpsLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "0.48rem 0.9rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            cursor: isGpsLoading ? "not-allowed" : "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 0.15s",
          }}
          title="Detect GPS location"
        >
          {isGpsLoading ? (
            <div className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <Crosshair size={16} style={{ color: "var(--accent)" }} />
          )}
          <span>GPS Location</span>
        </button>

        {/* Manual Coordinates Toggle */}
        <button
          type="button"
          onClick={() => {
            setShowManualCoords(!showManualCoords);
            setManualLat(currentLocation.latitude.toString());
            setManualLon(currentLocation.longitude.toString());
            setManualName(currentLocation.name);
            setManualError(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: showManualCoords ? "var(--bg-elevated)" : "var(--bg-card)",
            border: `1px solid ${showManualCoords ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 10,
            padding: "0.48rem 0.9rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: showManualCoords ? "var(--accent-hover)" : "var(--text-primary)",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 0.15s",
          }}
          title="Enter custom coordinates"
        >
          <Sliders size={16} />
          <span>Manual Lat / Lon</span>
        </button>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "var(--accent)",
            border: "none",
            borderRadius: 10,
            padding: "0.48rem 0.95rem",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#ffffff",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 6px rgba(14, 165, 233, 0.3)",
            transition: "all 0.15s",
          }}
          title="Refresh current forecast"
        >
          <RefreshCw
            size={15}
            style={{
              animation: isLoading ? "spin 1s linear infinite" : "none",
            }}
          />
          <span>{isLoading ? "Fetching..." : "Refresh"}</span>
        </button>
      </div>

      {/* GPS Error notification */}
      {gpsError && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "0.55rem 0.85rem",
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--accent-danger)",
            fontSize: "0.82rem",
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Manual Coordinates Drawer */}
      {showManualCoords && (
        <form
          onSubmit={handleApplyManualCoords}
          style={{
            marginTop: "0.85rem",
            padding: "1rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.88rem",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--text-primary)",
            }}
          >
            <Compass size={16} style={{ color: "var(--accent)" }} />
            <span>Specify Geographical Coordinates</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 3,
                }}
              >
                Location Label (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. My Farm / Field 1"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.65rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 3,
                }}
              >
                Latitude (-90 to +90)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.45rem 0.65rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 3,
                }}
              >
                Longitude (-180 to +180)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.45rem 0.65rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {manualError && (
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--accent-danger)",
                marginBottom: "0.6rem",
              }}
            >
              {manualError}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => setShowManualCoords(false)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0.4rem 0.95rem",
                borderRadius: 6,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Apply Coordinates
            </button>
          </div>
        </form>
      )}

      {/* Quick Location Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginTop: "0.75rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          Quick Select:
        </span>
        {DEFAULT_LOCATIONS.slice(0, 8).map((loc) => {
          const isSelected =
            Math.abs(loc.latitude - currentLocation.latitude) < 0.05 &&
            Math.abs(loc.longitude - currentLocation.longitude) < 0.05;
          return (
            <button
              key={loc.name}
              type="button"
              onClick={() => handleSelectLocation(loc)}
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-subtle)"}`,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Selected Location Details Strip */}
      <div
        style={{
          marginTop: "0.85rem",
          padding: "0.75rem 1rem",
          background: "var(--bg-card)",
          borderRadius: 10,
          border: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--bg-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <MapPin size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                {currentLocation.name}
              </span>
              {currentLocation.country && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    background: "rgba(0,0,0,0.04)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                  }}
                >
                  {[currentLocation.admin1, currentLocation.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: 2,
              }}
            >
              <span>{formatCoordDisplay(currentLocation.latitude, currentLocation.longitude)}</span>
              {currentLocation.elevation !== undefined && (
                <span>• Elevation: {Math.round(currentLocation.elevation)} m</span>
              )}
              {currentLocation.timezone && (
                <span>• TZ: {currentLocation.timezone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Data Status Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.74rem" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              background: isCached ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
              color: isCached ? "#d97706" : "#059669",
              border: `1px solid ${isCached ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
              padding: "0.2rem 0.55rem",
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            <Check size={12} />
            <span>{isCached ? "Cached (15m TTL)" : "Live Open-Meteo"}</span>
          </span>

          {lastUpdated && (
            <span style={{ color: "var(--text-muted)" }}>
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
