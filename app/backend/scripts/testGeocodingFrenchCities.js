#!/usr/bin/env node

// Simple test script to verify geocoding with French cities
const https = require('https');
const querystring = require('querystring');

async function geocode(city) {
  return new Promise((resolve, reject) => {
    const path = `/search?${querystring.stringify({
      q: city,
      format: 'json',
      limit: 1,
      addressdetails: 1
    })}`;
    
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Matcha/1.0 (https://github.com/your-repo/matcha)'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response && response.length > 0) {
            const result = response[0];
            resolve({
              lat: parseFloat(result.lat),
              lon: parseFloat(result.lon),
              displayName: result.display_name
            });
          } else {
            reject(new Error('No results found for address'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse geocoding response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Geocoding request failed: ${error.message}`));
    });
    
    req.end();
  });
}

async function testFrenchCities() {
  // Common French cities
  const frenchCities = [
    "Paris, France",
    "Lyon, France", 
    "Marseille, France",
    "Lille, France",
    "Strasbourg, France",
    "Saint-Denis, France",
    "Toulouse, France",
    "Bordeaux, France",
    "Nice, France",
    "Nantes, France"
  ];
  
  console.log("Testing geocoding with French cities...\n");
  
  for (const city of frenchCities) {
    try {
      console.log(`Geocoding: ${city}`);
      const result = await geocode(city);
      console.log(`  Result: lat=${result.lat.toFixed(4)}, lon=${result.lon.toFixed(4)}`);
      console.log(`  Display: ${result.displayName}\n`);
    } catch (error) {
      console.log(`  Error: ${error.message}\n`);
    }
  }
}

if (require.main === module) {
  testFrenchCities().catch(console.error);
}