// Api/location.js
import { Country, State, City } from 'country-state-city';

const COUNTRY_CODE_MAP = {
  'USA': 'US',
  'UK': 'GB',
  'Canada': 'CA'
};

// UK-এর জন্য কাস্টম স্টেট ম্যাপিং (যেহেতু প্যাকেজে England, Scotland আলাদা স্টেট হিসেবে নেই)
const UK_STATE_MAPPING = {
  'England': 'England',
  'Scotland': 'Scotland',
  'Wales': 'Wales',
  'Northern Ireland': 'Northern Ireland'
};

// UK-এর জন্য ফallback সিটি ডাটা
// Api/location.js

const UK_CITIES_FALLBACK = {
  'England': [
    // Greater London
    'London', 'Croydon', 'Barnet', 'Bromley', 'Enfield', 'Hillingdon', 'Hounslow', 'Kingston upon Thames',
    
    // North West
    'Manchester', 'Liverpool', 'Bolton', 'Stockport', 'Salford', 'Wigan', 'Blackburn', 'Blackpool', 
    'Preston', 'Burnley', 'Bury', 'Oldham', 'Rochdale', 'St Helens', 'Warrington', 'Chester',
    
    // West Midlands
    'Birmingham', 'Coventry', 'Wolverhampton', 'Stoke-on-Trent', 'Solihull', 'Walsall', 'Dudley',
    'Telford', 'Shrewsbury', 'Stafford', 'Hereford', 'Worcester',
    
    // Yorkshire and Humber
    'Leeds', 'Sheffield', 'Bradford', 'York', 'Hull', 'Wakefield', 'Doncaster', 'Rotherham', 
    'Barnsley', 'Halifax', 'Huddersfield', 'Harrogate', 'Scarborough',
    
    // East Midlands
    'Nottingham', 'Leicester', 'Derby', 'Lincoln', 'Northampton', 'Mansfield', 'Chesterfield',
    
    // East of England
    'Cambridge', 'Norwich', 'Peterborough', 'Ipswich', 'Colchester', 'Southend-on-Sea', 
    'Luton', 'Bedford', 'Chelmsford', 'Stevenage', 'Watford',
    
    // South East
    'Oxford', 'Southampton', 'Portsmouth', 'Brighton', 'Reading', 'Milton Keynes', 'Slough',
    'Guildford', 'Maidstone', 'Canterbury', 'Dover', 'Bournemouth', 'Poole', 'Winchester',
    'Basingstoke', 'Crawley', 'Worthing', 'Eastbourne', 'Hastings',
    
    // South West
    'Bristol', 'Plymouth', 'Exeter', 'Bath', 'Swindon', 'Gloucester', 'Cheltenham', 
    'Truro', 'St Austell', 'Falmouth', 'Taunton', 'Yeovil', 'Salisbury',
    
    // North East
    'Newcastle upon Tyne', 'Sunderland', 'Durham', 'Middlesbrough', 'Darlington', 
    'Gateshead', 'South Shields', 'Hartlepool', 'Stockton-on-Tees'
  ],
  
  'Scotland': [
    // Major Cities
    'Glasgow', 'Edinburgh', 'Aberdeen', 'Dundee', 'Inverness', 'Perth', 'Stirling',
    
    // Central Belt
    'Paisley', 'East Kilbride', 'Livingston', 'Hamilton', 'Cumbernauld', 'Kirkcaldy',
    'Ayr', 'Kilmarnock', 'Greenock', 'Coatbridge', 'Motherwell', 'Falkirk',
    
    // North East
    'Elgin', 'Peterhead', 'Fraserburgh', 'Banff', 'Stonehaven', 'Montrose',
    
    // Highlands & Islands
    'Fort William', 'Oban', 'Portree', 'Stornoway', 'Kirkwall', 'Lerwick',
    'Thurso', 'Wick', 'Ullapool', 'Mallaig',
    
    // Borders & Dumfries
    'Dumfries', 'Hawick', 'Galashiels', 'Peebles', 'Kelso', 'Jedburgh',
    
    // Fife & Tayside
    'Dunfermline', 'Glenrothes', 'St Andrews', 'Cupar', 'Arbroath', 'Forfar'
  ],
  
  'Wales': [
    // South Wales
    'Cardiff', 'Swansea', 'Newport', 'Barry', 'Bridgend', 'Port Talbot', 'Neath',
    'Merthyr Tydfil', 'Caerphilly', 'Pontypridd', 'Ebbw Vale', 'Rhondda',
    
    // North Wales
    'Bangor', 'Wrexham', 'Rhyl', 'Colwyn Bay', 'Llandudno', 'Holyhead', 
    'Caernarfon', 'Conwy', 'Prestatyn', 'Flint',
    
    // West Wales
    'Carmarthen', 'Llanelli', 'Haverfordwest', 'Milford Haven', 'Pembroke',
    'Tenby', 'Fishguard', 'Cardigan', 'Aberystwyth',
    
    // Mid Wales
    'Newtown', 'Welshpool', 'Brecon', 'Llandrindod Wells', 'Builth Wells',
    'Machynlleth', 'Lampeter', 'Rhayader'
  ],
  
  'Northern Ireland': [
    // Greater Belfast
    'Belfast', 'Lisburn', 'Newtownabbey', 'Bangor', 'Carrickfergus', 'Holywood',
    'Castlereagh', 'Dundonald', 'Antrim', 'Ballyclare',
    
    // Derry & North West
    'Derry', 'Londonderry', 'Limavady', 'Coleraine', 'Portrush', 'Portstewart',
    'Ballymoney', 'Strabane',
    
    // County Antrim
    'Ballymena', 'Larne', 'Ballycastle', 'Cushendall', 'Randalstown',
    
    // County Down
    'Newry', 'Downpatrick', 'Newcastle', 'Warrenpoint', 'Banbridge',
    'Armagh', 'Portadown', 'Lurgan', 'Craigavon',
    
    // County Tyrone
    'Omagh', 'Dungannon', 'Cookstown', 'Coalisland', 'Fivemiletown',
    
    // County Fermanagh
    'Enniskillen', 'Lisnaskea', 'Irvinestown', 'Belleek',
    
    // County Armagh
    'Armagh City', 'Lurgan', 'Portadown', 'Keady', 'Tandragee'
  ]
};

export function getStates(country) {
  try {
    console.log('📍 getStates called for:', country);
    const countryCode = COUNTRY_CODE_MAP[country];
    if (!countryCode) return [];
    
    // UK-এর জন্য কাস্টম স্টেট রিটার্ন করুন
    if (country === 'UK') {
      const ukStates = [
        { name: 'England', code: 'ENG' },
        { name: 'Scotland', code: 'SCT' },
        { name: 'Wales', code: 'WLS' },
        { name: 'Northern Ireland', code: 'NIR' }
      ];
      console.log(`✅ Found ${ukStates.length} states for UK (custom mapping)`);
      return ukStates;
    }
    
    // অন্যান্য দেশের জন্য প্যাকেজ থেকে স্টেট নিন
    const states = State.getStatesOfCountry(countryCode);
    console.log(`✅ Found ${states.length} states for ${country}`);
    
    return states.map(state => ({
      name: state.name,
      code: state.isoCode
    }));
  } catch (error) {
    console.error('❌ Error in getStates:', error);
    return [];
  }
}

export function fetchCitiesByState(country, stateName) {
  try {
    console.log('📍 fetchCitiesByState called for:', { country, stateName });
    
    const countryCode = COUNTRY_CODE_MAP[country];
    if (!countryCode) {
      console.log('❌ No country code for:', country);
      return [];
    }
    
    // UK-এর জন্য ফallback ডাটা ব্যবহার করুন
    if (country === 'UK') {
      console.log('🇬🇧 Using UK fallback data for', stateName);
      
      // স্টেটের নাম নরমালাইজ করুন
      const normalizedState = stateName?.trim();
      
      // ফallback থেকে সিটি নিন
      const cities = UK_CITIES_FALLBACK[normalizedState] || [];
      console.log(`✅ Found ${cities.length} cities for ${stateName} (fallback)`);
      
      return cities.map(city => ({ name: city }));
    }
    
    // অন্যান্য দেশের জন্য প্যাকেজ থেকে সিটি নিন
    const states = State.getStatesOfCountry(countryCode);
    const selectedState = states.find(s => 
      s.name.toLowerCase().trim() === stateName.toLowerCase().trim()
    );
    
    if (!selectedState) {
      console.warn('⚠️ State not found:', stateName);
      return [];
    }
    
    const cities = City.getCitiesOfState(countryCode, selectedState.isoCode);
    console.log(`✅ Found ${cities.length} cities for ${stateName}`);
    
    return cities.map(city => ({
      name: city.name
    }));
  } catch (error) {
    console.error('❌ Error in fetchCitiesByState:', error);
    return [];
  }
}

export function getPostalCodes() {
  console.warn('⚠️ Postal codes not available in country-state-city package');
  return [];
}