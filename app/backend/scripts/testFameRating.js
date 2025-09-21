#!/usr/bin/env node

// Simple test script to verify fame rating calculation
const { calculateFameRating } = require('./services/fameRatingService');

// Mock data for testing
const mockUserId = 1;

// Test the calculation function
async function testFameRating() {
  try {
    console.log('Testing fame rating calculation...');
    const rating = await calculateFameRating(mockUserId);
    console.log(`Calculated fame rating for user ${mockUserId}: ${rating}`);
  } catch (error) {
    console.error('Error calculating fame rating:', error.message);
  }
}

if (require.main === module) {
  testFameRating();
}