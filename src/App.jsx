import { useState, useEffect } from "react";
import {
  Search,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  MapPin,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { analytics } from "./utils/analytics";
import "./index.css";

const API_KEY = "d092a2d1219fceb3877c07106c328d54";

const backgroundMap = {
  Clear:
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=2000",
  Clouds:
    "https://images.unsplash.com/photo-1534088568595-a066f7104218?auto=format&fit=crop&q=80&w=2000",
  Rain: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=2000",
  Drizzle:
    "https://images.unsplash.com/photo-1556485684-70f5e4685ffb?auto=format&fit=crop&q=80&w=2000",
  Thunderstorm:
    "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80&w=2000",
  Snow: "https://images.unsplash.com/photo-1517299321529-639f4e242940?auto=format&fit=crop&q=80&w=2000",
  Default: "./background.png",
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [bg, setBg] = useState(backgroundMap["Default"]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setDateTime(now.toLocaleDateString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async (e) => {
    if (e) e.preventDefault();
    if (!city.trim()) {
      setError("Enter a city name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&APPID=${API_KEY}`,
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, country } = geoData[0];
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`,
      );
      const data = await weatherRes.json();

      setWeather({ ...data, displayName: `${name}, ${country}` });
      setBg(backgroundMap[data.weather[0].main] || backgroundMap["Default"]);
      analytics.trackSearch(city, "success");
    } catch (err) {
      setError(err.message || "Check connection");
      analytics.trackSearch(city, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ backgroundImage: `url(${bg})` }}>
      <header className="search-section">
        <form className="search-bar" onSubmit={fetchWeather}>
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Enter a city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
        <div className="user-location-info">
          <h1 className="city-title">
            {weather ? weather.displayName : "Weather Analytics"}
          </h1>
          <p className="date-subtitle">{error ? error : dateTime}</p>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="glass-card current-weather">
          <div className="weather-visual">
            {loading ? (
              <div className="spinner"></div>
            ) : weather ? (
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt="weather icon"
                className="main-icon"
              />
            ) : (
              <Search size={64} opacity={0.2} />
            )}
          </div>
          <div className="temp-container">
            <span>{weather ? Math.round(weather.main.temp) : "--"}</span>
            <span className="unit">°C</span>
          </div>
          <div className="condition-text">
            {weather ? weather.weather[0].description : "Search for a city"}
          </div>
          <div className="high-low">
            <span>
              <ArrowUp
                size={16}
                className="hot"
                style={{ display: "inline" }}
              />{" "}
              H: {weather ? Math.round(weather.main.temp_max) : "--"}°
            </span>
            <span>
              <ArrowDown
                size={16}
                className="cold"
                style={{ display: "inline" }}
              />{" "}
              L: {weather ? Math.round(weather.main.temp_min) : "--"}°
            </span>
          </div>
        </aside>

        <div className="metrics-container">
          <MetricCard
            icon={<Wind />}
            label="Wind Speed"
            value={weather ? `${weather.wind.speed} m/s` : "--"}
          />
          <MetricCard
            icon={<Droplets />}
            label="Humidity"
            value={weather ? `${weather.main.humidity} %` : "--"}
          />
          <MetricCard
            icon={<Thermometer />}
            label="Feels Like"
            value={weather ? `${Math.round(weather.main.feels_like)} °C` : "--"}
          />
          <MetricCard
            icon={<Gauge />}
            label="Pressure"
            value={weather ? `${weather.main.pressure} hPa` : "--"}
          />
          <MetricCard
            icon={<Eye />}
            label="Visibility"
            value={
              weather ? `${(weather.visibility / 1000).toFixed(1)} km` : "--"
            }
          />
          <MetricCard
            icon={<Sunrise />}
            label="Sunrise"
            value={
              weather
                ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--"
            }
          />
          <MetricCard
            icon={<Sunset />}
            label="Sunset"
            value={
              weather
                ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--"
            }
          />
          <MetricCard
            icon={<MapPin />}
            label="Coordinates"
            value={
              weather
                ? `${weather.coord.lat.toFixed(2)}, ${weather.coord.lon.toFixed(2)}`
                : "--"
            }
            compact
          />
        </div>
      </section>

      <footer className="insight-footer">
        <p>Tip: Use higher resolution sensors for better climate clues.</p>
      </footer>
    </div>
  );
}

function MetricCard({ icon, label, value, compact }) {
  return (
    <div className="glass-card metric-card fade-in">
      <div className="card-header">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`card-value ${compact ? "compact" : ""}`}>{value}</div>
    </div>
  );
}

export default App;
