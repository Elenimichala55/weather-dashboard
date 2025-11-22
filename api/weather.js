export default async function handler(req, res) {
    const lat = req.query.lat;
    const lon = req.query.lon;

    if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon are required" });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    const currentURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentURL),
            fetch(forecastURL),
        ]);

        const current = await currentRes.json();
        const forecast = await forecastRes.json();

        return res.status(200).json({
            current,
            forecast
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}