#!/usr/bin/env node

// Simple test script to verify distance calculation with real coordinates
console.log("Testing distance calculation with known coordinates...\n");

// Known coordinates for French cities
const coordinates = {
  saintDenis: { lat: 48.9361, lon: 2.3574, name: "Saint-Denis" },
  strasbourg: { lat: 48.5734, lon: 7.7521, name: "Strasbourg" },
  paris: { lat: 48.8566, lon: 2.3522, name: "Paris" },
  lille: { lat: 50.6292, lon: 3.0573, name: "Lille" },
  lyon: { lat: 45.7640, lon: 4.8357, name: "Lyon" },
  marseille: { lat: 43.2965, lon: 5.3698, name: "Marseille" }
};

// Implement the same formula used in SQL
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  
  // Convert to radians
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const deltaLatRad = (lat2 - lat1) * Math.PI / 180;
  const deltaLonRad = (lon2 - lon1) * Math.PI / 180;
  
  // Haversine formula
  const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
            Math.sin(deltaLonRad/2) * Math.sin(deltaLonRad/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  
  return d;
}

// Test the distance between Saint-Denis and Strasbourg
const distance = calculateDistance(
  coordinates.saintDenis.lat, 
  coordinates.saintDenis.lon, 
  coordinates.strasbourg.lat, 
  coordinates.strasbourg.lon
);

console.log(`Distance between ${coordinates.saintDenis.name} and ${coordinates.strasbourg.name}:`);
console.log(`Coordinates: (${coordinates.saintDenis.lat}, ${coordinates.saintDenis.lon}) to (${coordinates.strasbourg.lat}, ${coordinates.strasbourg.lon})`);
console.log(`Calculated distance: ${distance.toFixed(2)} km\n`);

// Test a few more distances
const pairs = [
  { from: coordinates.paris, to: coordinates.lille },
  { from: coordinates.paris, to: coordinates.lyon },
  { from: coordinates.paris, to: coordinates.marseille }
];

pairs.forEach(pair => {
  const dist = calculateDistance(
    pair.from.lat, 
    pair.from.lon, 
    pair.to.lat, 
    pair.to.lon
  );
  console.log(`Distance between ${pair.from.name} and ${pair.to.name}: ${dist.toFixed(2)} km`);
});

console.log("\nExpected distances (approximate):");
console.log("Saint-Denis to Strasbourg: ~400-500 km");
console.log("Paris to Lille: ~220 km");
console.log("Paris to Lyon: ~470 km");
console.log("Paris to Marseille: ~775 km");