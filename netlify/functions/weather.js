/**
 * Weather (AQI + UV + next 8 hours) via weatherapi.com
 * Env: WEATHERAPI_KEY
 */
export async function handler(event) {
  try {
    const key = process.env.WEATHERAPI_KEY;
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: "Missing WEATHERAPI_KEY" }) };

    const q = (event.queryStringParameters && event.queryStringParameters.q) || "Madison,MS";
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&days=1&aqi=yes&alerts=no`;

    const r = await fetch(url);
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify({ error: `Weather API error ${r.status}` }) };

    const data = await r.json();
    const hours = (data?.forecast?.forecastday?.[0]?.hour || []);
    const now = new Date();
    const currentHour = now.getHours();
    const upcoming = hours.filter(h => {
      const hHour = new Date(h.time).getHours();
      return hHour >= currentHour;
    }).slice(0, 8);

    const aqi = data?.current?.air_quality?.["us-epa-index"] ?? null;
    const aqiLabel = aqi === 1 ? "Good" : aqi === 2 ? "Moderate" : aqi === 3 ? "Unhealthy (Sensitive)" : aqi === 4 ? "Unhealthy" : aqi === 5 ? "Very Unhealthy" : aqi === 6 ? "Hazardous" : null;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        location: data?.location?.name || q,
        region: data?.location?.region,
        aqi,
        aqiLabel,
        current: data?.current,
        forecast: data?.forecast?.forecastday?.[0]?.day,
        next_hours: upcoming
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message || String(e) }) };
  }
}
