#!/usr/bin/env node

// Test script to see what the randomuser.me API returns
const https = require('https');

async function testRandomUserAPI() {
  return new Promise((resolve, reject) => {
    const url = 'https://randomuser.me/api/?nat=fr&results=5';
    
    console.log('Fetching data from randomuser.me API...');
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const users = JSON.parse(data);
          console.log('Received', users.results.length, 'users');
          
          users.results.forEach((user, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(`  Name: ${user.name.first} ${user.name.last}`);
            console.log(`  City: ${user.location.city}`);
            console.log(`  Country: ${user.location.country}`);
            console.log(`  Coordinates: lat=${user.location.coordinates.latitude}, lon=${user.location.coordinates.longitude}`);
            
            // Check if coordinates look reasonable
            const lat = parseFloat(user.location.coordinates.latitude);
            const lon = parseFloat(user.location.coordinates.longitude);
            
            if (lat < 40 || lat > 52 || lon < -5 || lon > 10) {
              console.log(`  WARNING: Suspicious coordinates for France!`);
            }
          });
          
          resolve(users);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

if (require.main === module) {
  testRandomUserAPI().catch(console.error);
}