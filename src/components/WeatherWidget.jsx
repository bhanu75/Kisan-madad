import { useEffect, useState } from "react";

const WeatherWidget = ({ city = "Chittorgarh" }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Step 1: Get lat/lon from Open-Meteo Geocoding API
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=hi&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) return;

        const { latitude, longitude } = geoData.results[0];

        // Step 2: Fetch weather + soil data
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_1cm&timezone=auto`
        );
        const data = await res.json();
        setWeather(data.current);
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };

    fetchWeather();
  }, [city]);

  if (!weather) return <div>Loading weather...</div>;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">🌤 मौसम - {city}</h2>
      <div className="text-2xl font-bold mb-2">
        {weather.temperature_2m}°C
      </div>

      {/* Extra Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>💧 आर्द्रता: {weather.relative_humidity_2m}%</div>
        <div>🌬️ हवा: {weather.wind_speed_10m} km/h</div>
        <div>🌱 मिट्टी तापमान: {weather.soil_temperature_0cm}°C</div>
        <div>💦 मिट्टी नमी: {(weather.soil_moisture_0_1cm * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
};

export default WeatherWidget;
