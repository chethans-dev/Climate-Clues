import { analytics } from "./Analytics.js";

class WeatherApp {
  constructor() {
    this.apiKey = "d092a2d1219fceb3877c07106c328d54"; // Kept original API key for continuity
    this.cache = new Map();

    // DOM Elements
    this.elements = {
      input: document.getElementById("city-input"),
      btn: document.getElementById("search-btn"),
      cityName: document.getElementById("city-name"),
      dateTime: document.getElementById("date-time"),
      temp: document.getElementById("temp-value"),
      maxTemp: document.getElementById("temp-max"),
      minTemp: document.getElementById("temp-min"),
      condition: document.getElementById("weather-condition"),
      icon: document.getElementById("weather-icon"),
      wind: document.getElementById("wind-speed"),
      humidity: document.getElementById("humidity"),
      feelsLike: document.getElementById("feels-like"),
      pressure: document.getElementById("pressure"),
      visibility: document.getElementById("visibility"),
      sunrise: document.getElementById("sunrise-time"),
      sunset: document.getElementById("sunset-time"),
      coords: document.getElementById("coords"),
      spinner: document.getElementById("loading-spinner"),
      app: document.querySelector(".app-container"),
    };

    this.init();
  }

  init() {
    this.elements.btn.addEventListener("click", () => this.fetchWeather());
    this.elements.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.fetchWeather();
    });

    // Display current date
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 60000);
  }

  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    this.elements.dateTime.innerText = now.toLocaleDateString("en-US", options);
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.elements.spinner.classList.remove("hidden");
      this.elements.icon.classList.add("hidden");
    } else {
      this.elements.spinner.classList.add("hidden");
      this.elements.icon.classList.remove("hidden");
    }
  }

  async fetchWeather() {
    const city = this.elements.input.value.trim();
    if (!city) {
      this.showError("Enter a city");
      return;
    }

    this.setLoading(true);

    try {
      // Geocoding
      let geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&APPID=${this.apiKey}`,
      );
      let geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        throw new Error("City not found");
      }

      const { lat, lon, name, state, country } = geoData[0];

      // Weather Data
      let weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${this.apiKey}&units=metric`,
      );
      let data = await weatherRes.json();

      this.updateUI(data, { name, state, country });
      analytics.trackSearch(city, "success");
    } catch (error) {
      console.error("Fetch error:", error);
      this.showError(error.message || "Check connection");
      analytics.trackSearch(city, "error");
      analytics.trackError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  updateUI(data, loc) {
    const { main, wind, weather, sys, visibility, coord } = data;
    const condition = weather[0];

    // Basic Info
    this.elements.cityName.innerText = `${loc.name}, ${loc.country}`;
    this.elements.temp.innerText = Math.round(main.temp);
    this.elements.maxTemp.innerText = Math.round(main.temp_max);
    this.elements.minTemp.innerText = Math.round(main.temp_min);
    this.elements.condition.innerText = condition.description;

    // Metrics
    this.elements.wind.innerText = `${wind.speed} m/s`;
    this.elements.humidity.innerText = `${main.humidity} %`;
    this.elements.feelsLike.innerText = `${Math.round(main.feels_like)} °C`;
    this.elements.pressure.innerText = `${main.pressure} hPa`;
    this.elements.visibility.innerText = `${(visibility / 1000).toFixed(1)} km`;
    this.elements.coords.innerText = `${coord.lat.toFixed(2)}, ${coord.lon.toFixed(2)}`;

    // Sun
    this.elements.sunrise.innerText = new Date(
      sys.sunrise * 1000,
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.elements.sunset.innerText = new Date(
      sys.sunset * 1000,
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Icon
    this.elements.icon.src = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;

    // Dynamic Atmosphere
    this.updateBackground(condition.main);
  }

  updateBackground(mainCondition) {
    const conditions = {
      Clear:
        'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=2000")',
      Clouds:
        'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1534088568595-a066f7104218?auto=format&fit=crop&q=80&w=2000")',
      Rain: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=2000")',
      Drizzle:
        'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1556485684-70f5e4685ffb?auto=format&fit=crop&q=80&w=2000")',
      Thunderstorm:
        'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80&w=2000")',
      Snow: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1517299321529-639f4e242940?auto=format&fit=crop&q=80&w=2000")',
    };

    const bg = conditions[mainCondition] || conditions["Clouds"];
    this.elements.app.style.backgroundImage = bg;
  }

  showError(msg) {
    this.elements.cityName.innerText = "Error";
    this.elements.dateTime.innerText = msg;
    this.elements.temp.innerText = "--";
    this.elements.icon.classList.add("hidden");
  }
}

// Boot the app
new WeatherApp();
