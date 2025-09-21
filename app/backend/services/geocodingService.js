const https = require('https');
const querystring = require('querystring');

/**
 * Geocoding service for converting addresses to coordinates and vice versa
 */
class GeocodingService {
  constructor() {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    this.baseUrl = 'nominatim.openstreetmap.org';
  }

  /**
   * Forward geocode: Convert address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<{lat: number, lon: number, displayName: string, city: string, country: string}>} - Geocoded location data
   */
  async geocode(address) {
    return new Promise((resolve, reject) => {
      const path = `/search?${querystring.stringify({
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      })}`;
      
      const options = {
        hostname: this.baseUrl,
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
                displayName: result.display_name,
                city: this._extractCity(result.address),
                country: result.address?.country || ''
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

  /**
   * Reverse geocode: Convert coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<{displayName: string, city: string, country: string}>} - Reverse geocoded address data
   */
  async reverseGeocode(lat, lon) {
    return new Promise((resolve, reject) => {
      const path = `/reverse?${querystring.stringify({
        lat: lat,
        lon: lon,
        format: 'json',
        addressdetails: 1
      })}`;
      
      const options = {
        hostname: this.baseUrl,
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
            
            if (response && response.address) {
              const result = response;
              resolve({
                displayName: result.display_name,
                city: this._extractCity(result.address),
                country: result.address?.country || ''
              });
            } else {
              reject(new Error('No results found for coordinates'));
            }
          } catch (error) {
            reject(new Error(`Failed to parse reverse geocoding response: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Reverse geocoding request failed: ${error.message}`));
      });
      
      req.end();
    });
  }

  /**
   * Extract city name from address details
   * @param {object} address - Address details object
   * @returns {string} - City name
   */
  _extractCity(address) {
    if (!address) return '';
    
    // Try different fields in order of preference
    return address.city || 
           address.town || 
           address.village || 
           address.municipality || 
           '';
  }

  /**
   * Calculate distance between two coordinate points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this._deg2rad(lat2 - lat1);
    const dLon = this._deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this._deg2rad(lat1)) * Math.cos(this._deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  _deg2rad(deg) {
    return deg * (Math.PI/180);
  }
}

module.exports = new GeocodingService();