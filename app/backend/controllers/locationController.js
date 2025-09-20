const Location = require('../models/Location');
const geocodingService = require('../services/geocodingService');

/**
 * Update user location with geocoding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, city, country, locationMethod } = req.body;
    
    let locationData = {
      userId,
      locationMethod: locationMethod || 'MANUAL'
    };
    
    // Handle different location methods
    if (locationMethod === 'GPS' && latitude && longitude) {
      // Use provided GPS coordinates and reverse geocode to get address
      locationData.latitude = latitude;
      locationData.longitude = longitude;
      
      try {
        const address = await geocodingService.reverseGeocode(latitude, longitude);
        locationData.city = address.city || city || '';
        locationData.country = address.country || country || '';
      } catch (error) {
        console.warn('Failed to reverse geocode GPS coordinates:', error.message);
        // Fallback to provided city/country if available
        locationData.city = city || '';
        locationData.country = country || '';
      }
    } else if (city || country) {
      // Geocode address to get coordinates
      const addressQuery = `${city || ''}${city && country ? ', ' : ''}${country || ''}`;
      try {
        const geocoded = await geocodingService.geocode(addressQuery);
        locationData.latitude = geocoded.lat;
        locationData.longitude = geocoded.lon;
        locationData.city = geocoded.city || city || '';
        locationData.country = geocoded.country || country || '';
      } catch (error) {
        console.warn('Failed to geocode address:', error.message);
        // If geocoding fails, store what we have
        locationData.latitude = latitude || 0;
        locationData.longitude = longitude || 0;
        locationData.city = city || '';
        locationData.country = country || '';
      }
    } else if (latitude && longitude) {
      // Manual coordinates without address - try reverse geocoding
      locationData.latitude = latitude;
      locationData.longitude = longitude;
      
      try {
        const address = await geocodingService.reverseGeocode(latitude, longitude);
        locationData.city = address.city || '';
        locationData.country = address.country || '';
      } catch (error) {
        console.warn('Failed to reverse geocode coordinates:', error.message);
        locationData.city = '';
        locationData.country = '';
      }
    } else {
      return res.status(400).json({ 
        message: 'Either latitude/longitude or city/country must be provided' 
      });
    }
    
    // Save location to database
    const location = await Location.create(locationData);
    
    res.json({
      message: 'Location updated successfully',
      location: location.toJSON()
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user's current location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const location = await Location.findByUserId(userId);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    res.json(location.toJSON());
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  updateLocation,
  getCurrentLocation
};