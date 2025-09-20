#!/usr/bin/env node

// Simple test script to verify geocoding service works
const geocodingService = require('./services/geocodingService');

async function testGeocoding() {
  try {
    console.log('Testing geocoding service...');
    
    // Test forward geocoding (address to coordinates)
    console.log('Testing forward geocoding...');
    const geocoded = await geocodingService.geocode('Stains, France');
    console.log('Geocoded Stains, France:', geocoded);
    
    // Test reverse geocoding (coordinates to address)
    console.log('Testing reverse geocoding...');
    const reversed = await geocodingService.reverseGeocode(48.9047, 2.3742); // Stains coordinates
    console.log('Reversed geocoding for Stains:', reversed);
    
    // Test distance calculation
    console.log('Testing distance calculation...');
    const distance = geocodingService.calculateDistance(48.9047, 2.3742, 48.8566, 2.3522); // Stains to Paris
    console.log('Distance between Stains and Paris:', distance.toFixed(2), 'km');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error in geocoding test:', error.message);
  }
}

if (require.main === module) {
  testGeocoding();
}