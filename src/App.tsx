import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  condition: string; // main condition group
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
}

interface ForecastDay {
  date: string;
  day: string;
  temp_max: number;
  temp_min: number;
  icon: string;
  description: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "9eb16984bc7717de7906053a3425c783";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(unix: number, offset: number = 0): string {
  const date = new Date((unix + offset) * 1000);
  return date.toUTCString().slice(17, 22);
}

function getDayName(dateStr: string): string {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return days[new Date(dateStr).getDay()];
}

function getConditionBg(condition: string): string {
  const map: Record<string, string> = {
    Clear: "#C8B97A",
    Clouds: "#6B7280",
    Rain: "#3B82F6",
    Drizzle: "#60A5FA",
    Thunderstorm: "#7C3AED",
    Snow: "#93C5FD",
    Mist: "#9CA3AF",
    Fog: "#9CA3AF",
    Haze: "#B45309",
    Smoke: "#78716C",
    Dust: "#D97706",
    Sand: "#D97706",
    Ash: "#78716C",
    Squall: "#6366F1",
    Tornado: "#DC2626",
  };
  return map[condition] ?? "#4B5563";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [animating, setAnimating] = useState<boolean>(false);

  const fetchWeather = useCallback(
    async (city: string) => {
      if (!city.trim()) return;
      setLoading(true);
      setError(null);
      setAnimating(false);

      try {
        // Current weather
        const currentRes = await fetch(
          `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`
        );
        if (!currentRes.ok) {
          if (currentRes.status === 404) throw new Error("City not found. Try another location.");
          if (currentRes.status === 401) throw new Error("Invalid API key. Check your OpenWeather key.");
          throw new Error("Something went wrong. Try again.");
        }
        const currentData = await currentRes.json();

        // 5-day forecast
        const forecastRes = await fetch(
          `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`
        );
        const forecastData = await forecastRes.json();

        // Parse current weather
        const parsed: WeatherData = {
          city: currentData.name,
          country: currentData.sys.country,
          temp: Math.round(currentData.main.temp),
          feels_like: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          wind_speed: Math.round(currentData.wind.speed),
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
          condition: currentData.weather[0].main,
          visibility: Math.round(currentData.visibility / 1000),
          pressure: currentData.main.pressure,
          sunrise: currentData.sys.sunrise,
          sunset: currentData.sys.sunset,
        };

        // Parse 5-day forecast (one entry per day at noon)
        const dailyMap: Record<string, ForecastDay> = {};
        forecastData.list.forEach((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          if (!dailyMap[date]) {
            dailyMap[date] = {
              date,
              day: getDayName(date),
              temp_max: Math.round(item.main.temp_max),
              temp_min: Math.round(item.main.temp_min),
              icon: item.weather[0].icon,
              description: item.weather[0].description,
            };
          } else {
            dailyMap[date].temp_max = Math.max(
              dailyMap[date].temp_max,
              Math.round(item.main.temp_max)
            );
            dailyMap[date].temp_min = Math.min(
              dailyMap[date].temp_min,
              Math.round(item.main.temp_min)
            );
          }
        });

        const forecastDays = Object.values(dailyMap).slice(0, 5);

        setWeather(parsed);
        setForecast(forecastDays);
        setTimeout(() => setAnimating(true), 50);
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather.");
        setWeather(null);
      } finally {
        setLoading(false);
      }
    },
    [unit]
  );

  // Re-fetch when unit changes
  useEffect(() => {
    if (query) fetchWeather(query);
  }, [unit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      fetchWeather(inputValue.trim());
    }
  };

  const tempUnit = unit === "metric" ? "°C" : "°F";
  const windUnit = unit === "metric" ? "m/s" : "mph";
  const accentColor = weather ? getConditionBg(weather.condition) : "#C9F131";

  return (
    <div style={styles.root}>
      {/* ── Noise overlay ── */}
      <div style={styles.noise} aria-hidden />

      {/* ── Header ── */}
      <header style={styles.header}>
        <span style={styles.logoText}>ATMOS</span>
        <button
          onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
          style={{ ...styles.unitToggle, borderColor: accentColor, color: accentColor }}
          aria-label="Toggle temperature unit"
        >
          {unit === "metric" ? "°C → °F" : "°F → °C"}
        </button>
      </header>

      {/* ── Hero search ── */}
      <section style={styles.hero}>
        {!weather && !loading && (
          <p style={styles.heroEyebrow}>REAL-TIME WEATHER DATA</p>
        )}
        <h1 style={styles.heroTitle}>
          {weather
            ? `${weather.city.toUpperCase()}, ${weather.country}`
            : "WHERE ARE\nYOU RACING?"}
        </h1>

        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ENTER CITY NAME"
            style={styles.searchInput}
            aria-label="City search"
          />
          <button type="submit" style={{ ...styles.searchBtn, background: accentColor }} disabled={loading}>
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>

        {error && (
          <p style={styles.error}>{error}</p>
        )}
      </section>

      {/* ── Main weather card ── */}
      {weather && (
        <main
          style={{
            ...styles.mainCard,
            opacity: animating ? 1 : 0,
            transform: animating ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Big temp display */}
          <div style={styles.tempBlock}>
            <div style={styles.tempRow}>
              <span style={{ ...styles.bigTemp, color: accentColor }}>
                {weather.temp}
              </span>
              <span style={styles.tempUnitLabel}>{tempUnit}</span>
            </div>
            <p style={styles.conditionLabel}>
              {weather.description.toUpperCase()}
            </p>
            <p style={styles.feelsLike}>
              FEELS LIKE {weather.feels_like}{tempUnit}
            </p>
          </div>

          {/* Weather icon strip */}
          <div style={styles.iconStrip}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              style={{ ...styles.weatherIcon, filter: `drop-shadow(0 0 20px ${accentColor}60)` }}
            />
          </div>

          {/* Stats grid */}
          <div style={styles.statsGrid}>
            <StatCard label="HUMIDITY" value={`${weather.humidity}%`} icon="💧" accent={accentColor} />
            <StatCard label={`WIND ${windUnit}`} value={`${weather.wind_speed}`} icon="💨" accent={accentColor} />
            <StatCard label="VISIBILITY KM" value={`${weather.visibility}`} icon="👁" accent={accentColor} />
            <StatCard label="PRESSURE HPA" value={`${weather.pressure}`} icon="🌡" accent={accentColor} />
            <StatCard label="SUNRISE" value={formatTime(weather.sunrise)} icon="🌅" accent={accentColor} />
            <StatCard label="SUNSET" value={formatTime(weather.sunset)} icon="🌇" accent={accentColor} />
          </div>

          {/* Forecast strip */}
          {forecast.length > 0 && (
            <section style={styles.forecastSection}>
              <p style={{ ...styles.sectionLabel, borderColor: accentColor }}>5-DAY FORECAST</p>
              <div style={styles.forecastRow}>
                {forecast.map((day, i) => (
                  <div key={i} style={styles.forecastCard}>
                    <span style={{ ...styles.forecastDay, color: i === 0 ? accentColor : "#aaa" }}>
                      {i === 0 ? "TODAY" : day.day}
                    </span>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                      style={styles.forecastIcon}
                    />
                    <span style={styles.forecastMax}>{day.temp_max}{tempUnit}</span>
                    <span style={styles.forecastMin}>{day.temp_min}{tempUnit}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>POWERED BY OPENWEATHER API</span>
        <span style={{ ...styles.footerText, color: accentColor }}>◆ ATMOS 2025</span>
      </footer>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent: string;
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statIcon} aria-hidden>
        {icon}
      </span>
      <span style={{ ...styles.statValue, color: accent }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#0A0A0A",
    color: "#FFFFFF",
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    letterSpacing: "0.04em",
    overflowX: "hidden",
    position: "relative",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    backgroundRepeat: "repeat",
    backgroundSize: "200px 200px",
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.5,
  },
  header: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 2.5rem)",
    borderBottom: "1px solid #1C1C1C",
    gap: "1rem",
    flexWrap: "wrap",
  },
  logoText: {
    fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
    fontWeight: 700,
    letterSpacing: "0.3em",
    color: "#FFFFFF",
  },
  unitToggle: {
    background: "transparent",
    border: "1px solid",
    padding: "0.4rem 1rem",
    fontSize: "clamp(0.6rem, 1.5vw, 0.7rem)",
    fontWeight: 600,
    letterSpacing: "0.15em",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    borderRadius: "2px",
  },
  hero: {
    position: "relative",
    zIndex: 10,
    padding: "clamp(2rem, 8vw, 4rem) clamp(1.5rem, 5vw, 2.5rem) clamp(1.5rem, 6vw, 3rem)",
    maxWidth: "100%",
  },
  heroEyebrow: {
    fontSize: "0.65rem",
    fontWeight: 600,
    letterSpacing: "0.35em",
    color: "#555",
    marginBottom: "1rem",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 6vw, 5rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.01em",
    marginBottom: "2.5rem",
    whiteSpace: "pre-line",
    color: "#FFFFFF",
  },
  searchForm: {
    display: "flex",
    gap: "0",
    maxWidth: "100%",
    width: "clamp(100%, 500px, 100%)",
  },
  searchInput: {
    flex: 1,
    background: "#111",
    border: "1px solid #222",
    borderRight: "none",
    color: "#FFFFFF",
    fontSize: "clamp(0.7rem, 1.5vw, 0.8rem)",
    fontWeight: 600,
    letterSpacing: "0.15em",
    padding: "clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
  },
  searchBtn: {
    width: "clamp(48px, 10vw, 56px)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#000",
    flexShrink: 0,
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #00000040",
    borderTop: "2px solid #000",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  error: {
    color: "#EF4444",
    fontSize: "clamp(0.65rem, 1.2vw, 0.75rem)",
    letterSpacing: "0.1em",
    marginTop: "clamp(0.5rem, 1.5vw, 1rem)",
    fontWeight: 500,
    animation: "slideInUp 0.4s ease",
  },
  mainCard: {
    position: "relative",
    zIndex: 10,
    padding: "0 clamp(1.5rem, 5vw, 2.5rem) clamp(2rem, 6vw, 4rem)",
    transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  tempBlock: {
    padding: "clamp(1.5rem, 4vw, 3rem) 0 clamp(1rem, 3vw, 2rem)",
    borderTop: "1px solid #1C1C1C",
  },
  tempRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "clamp(0.2rem, 1vw, 0.5rem)",
    lineHeight: 1,
  },
  bigTemp: {
    fontSize: "clamp(4rem, 20vw, 12rem)",
    fontWeight: 800,
    lineHeight: 0.9,
    letterSpacing: "-0.04em",
    transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  tempUnitLabel: {
    fontSize: "clamp(1.5rem, 8vw, 4rem)",
    fontWeight: 300,
    color: "#444",
    paddingTop: "clamp(0.5rem, 2vw, 1rem)",
  },
  conditionLabel: {
    fontSize: "clamp(0.8rem, 2vw, 1.5rem)",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "#888",
    marginTop: "clamp(0.5rem, 1.5vw, 1rem)",
    transition: "all 0.3s ease",
  },
  feelsLike: {
    fontSize: "clamp(0.6rem, 1.2vw, 0.7rem)",
    fontWeight: 500,
    letterSpacing: "0.25em",
    color: "#444",
    marginTop: "0.5rem",
  },
  iconStrip: {
    margin: "clamp(0.5rem, 2vw, 1rem) 0 clamp(1rem, 3vw, 2rem)",
    animation: "float 3s ease-in-out infinite",
  },
  weatherIcon: {
    width: "clamp(60px, 15vw, 100px)",
    height: "clamp(60px, 15vw, 100px)",
    objectFit: "contain",
    filter: "brightness(1.2)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(clamp(100px, 20vw, 150px), 1fr))",
    gap: "1px",
    background: "#1A1A1A",
    border: "1px solid #1A1A1A",
    marginBottom: "1px",
  },
  statCard: {
    background: "#0A0A0A",
    padding: "clamp(1rem, 2.5vw, 1.5rem)",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
  },
  statIcon: {
    fontSize: "clamp(0.9rem, 2vw, 1.2rem)",
    marginBottom: "0.25rem",
  },
  statValue: {
    fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.01em",
    transition: "all 0.4s ease",
  },
  statLabel: {
    fontSize: "clamp(0.5rem, 1vw, 0.6rem)",
    fontWeight: 600,
    letterSpacing: "0.2em",
    color: "#444",
  },
  forecastSection: {
    marginTop: "clamp(1rem, 3vw, 2rem)",
  },
  sectionLabel: {
    fontSize: "clamp(0.55rem, 1.1vw, 0.65rem)",
    fontWeight: 600,
    letterSpacing: "0.3em",
    color: "#555",
    marginBottom: "clamp(1rem, 2vw, 1.5rem)",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid",
    transition: "all 0.3s ease",
  },
  forecastRow: {
    display: "flex",
    gap: "1px",
    background: "#1A1A1A",
    overflowX: "auto",
    paddingBottom: "0.5rem",
    scrollBehavior: "smooth",
  },
  forecastCard: {
    flex: "0 0 auto",
    background: "#0A0A0A",
    padding: "clamp(0.8rem, 2vw, 1.25rem) clamp(0.6rem, 1.5vw, 1rem)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    minWidth: "clamp(80px, 18vw, 120px)",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    cursor: "pointer",
  },
  forecastDay: {
    fontSize: "clamp(0.5rem, 1vw, 0.6rem)",
    fontWeight: 700,
    letterSpacing: "0.2em",
  },
  forecastIcon: {
    width: "clamp(32px, 6vw, 40px)",
    height: "clamp(32px, 6vw, 40px)",
    transition: "transform 0.3s ease",
  },
  forecastMax: {
    fontSize: "clamp(0.7rem, 1.5vw, 0.9rem)",
    fontWeight: 700,
    color: "#FFF",
  },
  forecastMin: {
    fontSize: "clamp(0.6rem, 1.2vw, 0.75rem)",
    fontWeight: 500,
    color: "#444",
  },
  footer: {
    position: "relative",
    zIndex: 10,
    padding: "clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 2.5rem)",
    borderTop: "1px solid #1C1C1C",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  footerText: {
    fontSize: "clamp(0.5rem, 1.2vw, 0.6rem)",
    fontWeight: 600,
    letterSpacing: "0.25em",
    color: "#333",
    transition: "color 0.3s ease",
  },
};
