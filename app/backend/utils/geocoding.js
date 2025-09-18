// Simple geocoding helpers using OpenStreetMap Nominatim
// Node 18+ has global fetch.

const BASE = "https://nominatim.openstreetmap.org";
const UA = "matcha-app/1.0 (contact: change-me@example.com)";

async function forwardGeocode(city, country) {
  if (!city && !country) return null;
  const q = [city, country].filter(Boolean).join(", ");
  const url = `${BASE}/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr,en" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const best = data[0];
  return {
    latitude: parseFloat(best.lat),
    longitude: parseFloat(best.lon),
    city: city || best.display_name?.split(",")[0]?.trim(),
    country: country || best.display_name?.split(",").pop()?.trim(),
  };
}

async function reverseGeocode(latitude, longitude) {
  if (typeof latitude !== "number" || typeof longitude !== "number")
    return null;
  const url = `${BASE}/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr,en" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const addr = data && data.address ? data.address : {};
  const cityLike =
    addr.city || addr.town || addr.village || addr.municipality || addr.county;
  return {
    latitude,
    longitude,
    city: cityLike || undefined,
    country: addr.country || undefined,
  };
}

module.exports = { forwardGeocode, reverseGeocode };
