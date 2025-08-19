import { useEffect, useState } from "react";

const WeatherWidget = () => {
  const [city, setCity] = useState("Jaipur");   // Default Jaipur
  const [input, setInput] = useState("Jaipur"); // Input state
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async (place) => {
    try {
      // Step 1: Geocoding
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${place}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      console.log("GeoData:", geoData);

      if (!geoData.results || geoData.results.length === 0) {
        setError("❌ Location not found");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Weather fetch
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_1cm&timezone=auto`
      );
      const data = await res.json();
      console.log("WeatherData:", data);

      if (data.current) {
        setWeather({ ...data.current, name, country });
        setError(null);
      } else {
        setError("⚠️ No current weather data found");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("⚡ API fetch failed");
    }
  };

  // Load on mount + whenever city changes
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setCity(input.trim());
      setWeather(null); // reset
    }
  };

  if (error) return <div className="p-4 bg-white rounded-2xl shadow-md">{error}</div>;
  if (!weather) return <div className="p-4 bg-white rounded-2xl shadow-md">Loading weather...</div>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      {/* Search box */}
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="गांव / शहर का नाम डालें"
          className="flex-1 p-2 border rounded-lg"
        />
        <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded-lg">
          खोजें
        </button>
      </form>

      {/* Weather Info */}
      <h2 className="text-lg font-semibold mb-2">🌤 मौसम - {weather.name}, {weather.country}</h2>
      <div className="text-2xl font-bold mb-2">
        {weather.temperature_2m}°C
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>💧 आर्द्रता: {weather.relative_humidity_2m}%</div>
        <div>🌬️ हवा: {weather.wind_speed_10m} km/h</div>
        <div>🌱 मिट्टी तापमान: {weather.soil_temperature_0cm}°C</div>
        <div>
          💦 मिट्टी नमी: {weather.soil_moisture_0_1cm 
            ? (weather.soil_moisture_0_1cm * 100).toFixed(1) + "%" 
            : "--"}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
