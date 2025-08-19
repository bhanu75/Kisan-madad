import React, { useState } from "react";

const WeatherWidget = () => {
  const [city, setCity] = useState("Delhi"); // default city
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔎 Step 1: City → Coordinates
  const fetchCoordinates = async (city) => {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=hi`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        location: data.results[0].name,
      };
    }
    throw new Error("स्थान नहीं मिला");
  };

  // 🌤️ Step 2: Weather fetch
  const fetchWeather = async (lat, lon) => {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=Asia/Kolkata`
    );
    return await res.json();
  };

  // 🎯 Step 3: Search Button Action
  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const { lat, lon, location } = await fetchCoordinates(city);
      const weatherData = await fetchWeather(lat, lon);
      setWeather({
        ...weatherData.current,
        location,
      });
    } catch (e) {
      setError("❌ " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <h2 className="text-lg font-bold mb-2">🌤️ मौसम जानकारी</h2>

      {/* City input */}
      <div className="flex gap-2 mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="अपना शहर/गाँव डालें"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
        >
          खोजें
        </button>
      </div>

      {/* Loading */}
      {loading && <p>⏳ मौसम डेटा लोड हो रहा है...</p>}

      {/* Error */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Weather Result */}
      {weather && (
        <div className="space-y-2">
          <p>📍 स्थान: {weather.location}</p>
          <p>🌡️ तापमान: {weather.temperature_2m}°C</p>
          <p>⛅ मौसम कोड: {weather.weathercode}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
