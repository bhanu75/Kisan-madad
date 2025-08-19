import { useState, useEffect } from "react";

const WeatherWidget = ({ location = "Delhi" }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${import.meta.env.VITE_WEATHER_KEY}`
        );
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) return <div>⏳ मौसम लोड हो रहा है...</div>;
  if (!weather || weather.cod !== 200) return <div>⚠️ मौसम डेटा नहीं मिला</div>;

  return (
    <div className="p-4 bg-blue-100 rounded-2xl shadow-md">
      <h3 className="font-semibold text-lg">🌤 मौसम ({weather.name})</h3>
      <p className="text-sm">🌡 {weather.main.temp}°C</p>
      <p className="text-sm">💧 Humidity: {weather.main.humidity}%</p>
      <p className="text-sm">🌬 Wind: {weather.wind.speed} m/s</p>
      <p className="italic text-xs text-gray-600">{weather.weather[0].description}</p>
    </div>
  );
};

export default WeatherWidget;
