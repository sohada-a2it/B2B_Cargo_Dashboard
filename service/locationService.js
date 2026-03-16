// services/locationService.js
import axios from 'axios';

// আপনার username .env.local থেকে নিবে
const GEONAMES_USERNAME = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;

console.log('📍 GeoNames Username:', GEONAMES_USERNAME); // ডিবাগ করার জন্য

const geonamesApi = axios.create({
  baseURL: 'http://api.geonames.org',
  timeout: 10000,
});

// 1. দেশের তালিকা পাওয়ার ফাংশন
export const getCountries = async () => {
  try {
    const response = await geonamesApi.get('/countryInfoJSON', {
      params: {
        username: GEONAMES_USERNAME,
        lang: 'en',
        style: 'full'
      }
    });
    
    if (response.data?.geonames) {
      // শুধু প্রয়োজনীয় দেশগুলো ফিল্টার করুন
      const relevantCountries = ['United States', 'United Kingdom', 'Canada', 'China', 'Thailand', 'Bangladesh', 'India'];
      
      return response.data.geonames
        .filter(country => relevantCountries.includes(country.countryName))
        .map(country => ({
          value: country.countryCode,
          label: country.countryName,
          code: country.countryCode,
          capital: country.capital,
          geonameId: country.geonameId
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

// 2. রাজ্য/প্রদেশের তালিকা পাওয়ার ফাংশন
export const getStatesByCountry = async (countryCode) => {
  try {
    // প্রথমে দেশের geonameId বের করুন
    const countryResponse = await geonamesApi.get('/countryInfoJSON', {
      params: {
        country: countryCode,
        username: GEONAMES_USERNAME
      }
    });
    
    const countryGeonameId = countryResponse.data?.geonames[0]?.geonameId;
    if (!countryGeonameId) return [];
    
    // এখন ঐ দেশের রাজ্যগুলো নিন
    const response = await geonamesApi.get('/childrenJSON', {
      params: {
        geonameId: countryGeonameId,
        username: GEONAMES_USERNAME,
        lang: 'en'
      }
    });
    
    if (response.data?.geonames) {
      return response.data.geonames
        .filter(region => region.fcode === 'ADM1') // ADM1 = State/Province
        .map(region => ({
          value: region.geonameId,
          label: region.name,
          code: region.adminCode1,
          geonameId: region.geonameId
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// 3. শহর/জেলার তালিকা পাওয়ার ফাংশন
export const getCitiesByState = async (stateGeonameId) => {
  try {
    const response = await geonamesApi.get('/childrenJSON', {
      params: {
        geonameId: stateGeonameId,
        username: GEONAMES_USERNAME,
        lang: 'en',
        maxRows: 100
      }
    });
    
    if (response.data?.geonames) {
      return response.data.geonames
        .filter(city => ['PPL', 'PPLC', 'PPLA'].includes(city.fcode)) // PPL = City
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .map(city => ({
          value: city.geonameId,
          label: city.name,
          geonameId: city.geonameId,
          population: city.population
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// 4. লোকেশন সার্চ করার ফাংশন
export const searchLocations = async (query, countryCode = null) => {
  try {
    const params = {
      q: query,
      username: GEONAMES_USERNAME,
      maxRows: 10,
      style: 'full'
    };
    
    if (countryCode) {
      params.country = countryCode;
    }
    
    const response = await geonamesApi.get('/searchJSON', { params });
    
    if (response.data?.geonames) {
      return response.data.geonames.map(item => ({
        value: item.geonameId,
        label: `${item.name}, ${item.countryName}`,
        type: item.fcode,
        geonameId: item.geonameId,
        lat: item.lat,
        lng: item.lng,
        countryCode: item.countryCode,
        countryName: item.countryName,
        stateName: item.adminName1
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};