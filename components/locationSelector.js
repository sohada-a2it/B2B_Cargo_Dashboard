// components/LocationSelector.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCountries, 
  getStatesByCountry, 
  getCitiesByState,
  searchLocations 
} from '@/service/locationService';
import { Loader2, Search, MapPin, ChevronDown } from 'lucide-react';

const LocationSelector = ({ onLocationSelect, initialCountry = null }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // 1. শুরুতে দেশের তালিকা লোড করুন
  useEffect(() => {
    loadCountries();
  }, []);

  // 2. দেশ সিলেক্ট করলে রাজ্যের তালিকা লোড করুন
  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry);
      setSelectedState('');
      setSelectedCity('');
    }
  }, [selectedCountry]);

  // 3. রাজ্য সিলেক্ট করলে শহরের তালিকা লোড করুন
  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState);
      setSelectedCity('');
    }
  }, [selectedState]);

  const loadCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    const data = await getCountries();
    setCountries(data);
    setLoading(prev => ({ ...prev, countries: false }));
    
    console.log('Loaded countries:', data); // ডিবাগ
  };

  const loadStates = async (countryCode) => {
    setLoading(prev => ({ ...prev, states: true }));
    const data = await getStatesByCountry(countryCode);
    setStates(data);
    setLoading(prev => ({ ...prev, states: false }));
    
    console.log('Loaded states:', data); // ডিবাগ
  };

  const loadCities = async (stateGeonameId) => {
    setLoading(prev => ({ ...prev, cities: true }));
    const data = await getCitiesByState(stateGeonameId);
    setCities(data);
    setLoading(prev => ({ ...prev, cities: false }));
    
    console.log('Loaded cities:', data); // ডিবাগ
  };

  const handleSearch = async (query) => {
    if (query.length < 3) return;
    
    setSearching(true);
    const results = await searchLocations(query, selectedCountry);
    setSearchResults(results);
    setSearching(false);
  };

  const handleLocationSelect = (location) => {
    onLocationSelect?.({
      countryName: location.countryName,
      stateName: location.stateName,
      cityName: location.label.split(',')[0],
      latitude: location.lat,
      longitude: location.lng,
      geonameId: location.geonameId
    });
    
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h3 className="text-sm font-medium text-gray-700">Location Selector</h3>
      
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border rounded-lg max-h-40 overflow-y-auto">
          {searchResults.map(result => (
            <button
              key={result.value}
              onClick={() => handleLocationSelect(result)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 border-b last:border-0"
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{result.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Manual Selection */}
      <div className="grid grid-cols-3 gap-3">
        {/* Country Select */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          >
            <option value="">Select</option>
            {countries.map(c => (
              <option key={c.value} value={c.code}>{c.label}</option>
            ))}
          </select>
          {loading.countries && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
        </div>

        {/* State Select */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={!selectedCountry || loading.states}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] disabled:bg-gray-100"
          >
            <option value="">Select</option>
            {states.map(s => (
              <option key={s.value} value={s.geonameId}>{s.label}</option>
            ))}
          </select>
          {loading.states && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
        </div>

        {/* City Select */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">City</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState || loading.cities}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] disabled:bg-gray-100"
          >
            <option value="">Select</option>
            {cities.map(c => (
              <option key={c.value} value={c.geonameId}>{c.label}</option>
            ))}
          </select>
          {loading.cities && <Loader2 className="h-4 w-4 animate-spin mt-1" />}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;