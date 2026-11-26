// ============================================================
// AIRSIGHT INDIA — CPCB Taxonomy, Pollutant Drivers & Advisor
// ============================================================

// Calibrated CPCB AQI bands with accessible daylight & dark observatory tones
export const AQI_BANDS = [
  { max: 50,  label: 'Good',      range: '0–50',   colorLight: '#059669', colorDark: '#34D399' },
  { max: 100, label: 'Moderate',  range: '51–100', colorLight: '#B45309', colorDark: '#FBBF24' },
  { max: 200, label: 'Poor',      range: '101–200', colorLight: '#C2410C', colorDark: '#FB923C' },
  { max: 300, label: 'Very Poor', range: '201–300', colorLight: '#B91C1C', colorDark: '#F87171' },
  { max: 500, label: 'Hazardous', range: '301–500', colorLight: '#7E22CE', colorDark: '#C084FC' },
];

export const getAQILevel = (aqi, isDark = false) => {
  const value = Number(aqi) || 0;
  if (value <= 50) {
    return {
      label: 'Good',
      range: '0–50',
      color: isDark ? '#34D399' : '#059669',
      softBg: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(5, 150, 105, 0.08)',
      border: isDark ? 'rgba(52, 211, 153, 0.28)' : 'rgba(5, 150, 105, 0.24)',
      text: 'Air quality is clean and satisfactory with minimal health risk.',
      guidance: 'Normal outdoor activity and ventilation are safe for all groups.',
    };
  }
  if (value <= 100) {
    return {
      label: 'Moderate',
      range: '51–100',
      color: isDark ? '#FBBF24' : '#B45309',
      softBg: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(180, 83, 9, 0.08)',
      border: isDark ? 'rgba(251, 191, 36, 0.28)' : 'rgba(180, 83, 9, 0.24)',
      text: 'Acceptable air quality; unusually sensitive individuals may experience mild discomfort.',
      guidance: 'Sensitive groups should consider moderating prolonged vigorous exertion.',
    };
  }
  if (value <= 200) {
    return {
      label: 'Poor',
      range: '101–200',
      color: isDark ? '#FB923C' : '#C2410C',
      softBg: isDark ? 'rgba(251, 146, 60, 0.12)' : 'rgba(194, 65, 12, 0.08)',
      border: isDark ? 'rgba(251, 146, 60, 0.28)' : 'rgba(194, 65, 12, 0.24)',
      text: 'Elevated particulate load that can affect people with asthma or heart conditions.',
      guidance: 'Limit prolonged outdoor exposure; consider N95 filtration during peak traffic.',
    };
  }
  if (value <= 300) {
    return {
      label: 'Very Poor',
      range: '201–300',
      color: isDark ? '#F87171' : '#B91C1C',
      softBg: isDark ? 'rgba(248, 113, 113, 0.12)' : 'rgba(185, 28, 28, 0.08)',
      border: isDark ? 'rgba(248, 113, 113, 0.28)' : 'rgba(185, 28, 28, 0.24)',
      text: 'Respiratory discomfort likely on prolonged exposure across the general population.',
      guidance: 'Avoid outdoor exercise, keep windows sealed, and run indoor HEPA filtration.',
    };
  }
  return {
    label: 'Hazardous',
    range: '301–500',
    color: isDark ? '#C084FC' : '#7E22CE',
    softBg: isDark ? 'rgba(192, 132, 252, 0.12)' : 'rgba(126, 34, 206, 0.08)',
    border: isDark ? 'rgba(192, 132, 252, 0.28)' : 'rgba(126, 34, 206, 0.24)',
    text: 'Severe atmospheric pollution posing acute respiratory risk to everyone.',
    guidance: 'Stay indoors, eliminate outdoor physical exertion, and use certified air purification.',
  };
};

// Detailed CPCB pollutant reference for driver attribution
export const POLLUTANT_INFO = {
  'PM2.5': {
    code: 'PM2.5',
    display: 'PM2.5',
    name: 'Fine Particulate Matter',
    scale: '≤ 2.5 µm aerodynamic diameter',
    source: 'Vehicular exhaust, biomass & crop burning, thermal power, and winter inversion.',
    note: 'Penetrates deep into alveoli; requires N95/FFP2 or HEPA H13 filtration.',
  },
  PM10: {
    code: 'PM10',
    display: 'PM10',
    name: 'Coarse Inhalable Particulates',
    scale: '≤ 10 µm aerodynamic diameter',
    source: 'Resuspended road dust, construction activity, industrial crushers, and dry winds.',
    note: 'Irritates upper airways; avoid dusty arterial corridors during dry afternoons.',
  },
  O3: {
    code: 'O3',
    display: 'O₃',
    name: 'Ground-Level Ozone',
    scale: 'Photochemical secondary gas',
    source: 'Sunlight reacting with urban NOx and volatile organic compounds.',
    note: 'Peaks between 1:00 PM and 5:00 PM; mornings are typically cleaner.',
  },
  NO2: {
    code: 'NO2',
    display: 'NO₂',
    name: 'Nitrogen Dioxide',
    scale: 'Combustion trace gas',
    source: 'Diesel transport corridors, power generation, and heavy traffic bottlenecks.',
    note: 'Concentrates near major roadways during morning and evening rush hours.',
  },
  SO2: {
    code: 'SO2',
    display: 'SO₂',
    name: 'Sulfur Dioxide',
    scale: 'Industrial trace gas',
    source: 'Coal combustion, refineries, and industrial smelting zones.',
    note: 'Can trigger bronchoconstriction in people with asthma even at brief exposure.',
  },
  CO: {
    code: 'CO',
    display: 'CO',
    name: 'Carbon Monoxide',
    scale: 'Incomplete combustion gas',
    source: 'Idling traffic, poorly ventilated intersections, and biomass burning.',
    note: 'Avoid enclosed garages and congested junctions; prioritize clean airflow.',
  },
};

export function getPollutantDetails(code) {
  if (!code) return POLLUTANT_INFO['PM2.5'];
  const key = String(code).toUpperCase().replace(/\s+/g, '');
  return POLLUTANT_INFO[key] || POLLUTANT_INFO['PM2.5'];
}

// Sensitivity profiles for the Outdoor Activity Advisor
export const SENSITIVITY_PROFILES = [
  { id: 'general',    label: 'General Public',      offset: 0 },
  { id: 'sensitive',  label: 'Sensitive / Asthma',  offset: 45 },
  { id: 'vulnerable', label: 'Children & Seniors',  offset: 60 },
];

export function getOutdoorGuidance(aqi, pollutantCode = 'PM2.5', profileId = 'general', isDark = false) {
  const profile = SENSITIVITY_PROFILES.find((p) => p.id === profileId) || SENSITIVITY_PROFILES[0];
  const effectiveAqi = (Number(aqi) || 0) + profile.offset;
  const isOzone = String(pollutantCode).toUpperCase() === 'O3';
  const isFinePm = String(pollutantCode).toUpperCase() === 'PM2.5';

  const tone = (status) => {
    if (status === 'Clear')   return isDark ? '#34D399' : '#059669';
    if (status === 'Caution') return isDark ? '#FBBF24' : '#B45309';
    if (status === 'Limit')   return isDark ? '#FB923C' : '#C2410C';
    return isDark ? '#F87171' : '#B91C1C';
  };

  // 1. Outdoor Exercise & Running
  let exercise;
  if (effectiveAqi <= 70) {
    exercise = {
      domain: 'Running & Exercise',
      status: 'Clear',
      headline: 'Full outdoor training',
      detail: 'Normal cardio, running, and endurance sessions are safe outdoors without time restriction.',
    };
  } else if (effectiveAqi <= 130) {
    exercise = {
      domain: 'Running & Exercise',
      status: 'Caution',
      headline: 'Keep workouts moderate',
      detail: isOzone
        ? 'Shift runs before 10:00 AM before afternoon ozone builds up.'
        : 'Favor parks away from arterial roads and cap high-intensity intervals at 45 minutes.',
    };
  } else if (effectiveAqi <= 210) {
    exercise = {
      domain: 'Running & Exercise',
      status: 'Limit',
      headline: 'Light walks or indoor gym',
      detail: 'Heavy mouth-breathing draws 3–5× more particulates deep into lungs; move cardio indoors.',
    };
  } else {
    exercise = {
      domain: 'Running & Exercise',
      status: 'Avoid',
      headline: 'Move all training indoors',
      detail: 'Cancel outdoor runs and field sports; opt for filtered indoor mobility or strength work.',
    };
  }

  // 2. Daily Commute
  let commute;
  if (effectiveAqi <= 90) {
    commute = {
      domain: 'Daily Commute',
      status: 'Clear',
      headline: 'Open travel & cycling fine',
      detail: 'Walking, two-wheelers, and cycling carry minimal respiratory burden across standard routes.',
    };
  } else if (effectiveAqi <= 165) {
    commute = {
      domain: 'Daily Commute',
      status: 'Caution',
      headline: 'Avoid peak-traffic idling',
      detail: 'Close car windows in dense junctions and switch vehicle HVAC to cabin recirculation mode.',
    };
  } else if (effectiveAqi <= 240) {
    commute = {
      domain: 'Daily Commute',
      status: 'Limit',
      headline: 'Prefer enclosed transit',
      detail: 'Minimize open two-wheeler or foot commutes; use metro or recirculated AC cabin travel.',
    };
  } else {
    commute = {
      domain: 'Daily Commute',
      status: 'Avoid',
      headline: 'Minimize non-essential travel',
      detail: 'Work remotely if possible; wear a well-sealed N95 respirator whenever stepping outside.',
    };
  }

  // 3. Mask & Indoor Filtration
  let filtration;
  if (effectiveAqi <= 95) {
    filtration = {
      domain: 'Mask & Filtration',
      status: 'Clear',
      headline: 'No respirator required',
      detail: 'Standard ambient air does not require masking or continuous high-speed purifier operation.',
    };
  } else if (effectiveAqi <= 160) {
    filtration = {
      domain: 'Mask & Filtration',
      status: 'Caution',
      headline: isFinePm ? 'N95 optional near traffic' : 'Dust mask near roadwork',
      detail: isFinePm
        ? 'Cloth masks miss PM2.5 particles; keep an N95/FFP2 handy for long commutes or dusty zones.'
        : 'Coarse dust spikes near construction; run indoor purifiers on low auto mode.',
    };
  } else if (effectiveAqi <= 235) {
    filtration = {
      domain: 'Mask & Filtration',
      status: 'Limit',
      headline: 'N95/FFP2 outdoors + HEPA',
      detail: 'Wear a snug N95 respirator outdoors and keep bedroom HEPA filtration running continuously.',
    };
  } else {
    filtration = {
      domain: 'Mask & Filtration',
      status: 'Avoid',
      headline: 'Strict N95 seal + high HEPA',
      detail: 'Verify nose-bridge seal on N95/FFP2 masks outside and run indoor HEPA H13 purifiers on medium-high.',
    };
  }

  // 4. Home Ventilation Window
  let ventilation;
  if (effectiveAqi <= 85) {
    ventilation = {
      domain: 'Home Ventilation',
      status: 'Clear',
      headline: 'Cross-ventilate freely',
      detail: 'Open windows morning and afternoon to refresh indoor CO₂ and maintain natural airflow.',
    };
  } else if (effectiveAqi <= 155) {
    ventilation = {
      domain: 'Home Ventilation',
      status: 'Caution',
      headline: isOzone ? 'Ventilate 7:00 – 10:00 AM' : 'Ventilate 1:00 – 4:00 PM',
      detail: isOzone
        ? 'Air out rooms early in the morning before solar radiation spikes ground-level ozone.'
        : 'Mid-afternoon thermal mixing lifts surface inversion; avoid opening windows at dusk or dawn.',
    };
  } else if (effectiveAqi <= 230) {
    ventilation = {
      domain: 'Home Ventilation',
      status: 'Limit',
      headline: 'Brief 15-min midday flush',
      detail: 'Keep windows closed overnight and during morning smog; ventilate briefly around 2:00 PM only.',
    };
  } else {
    ventilation = {
      domain: 'Home Ventilation',
      status: 'Avoid',
      headline: 'Keep windows sealed',
      detail: 'Seal window gaps, avoid incense or unvented indoor smoke, and rely on mechanical HEPA filtration.',
    };
  }

  return [exercise, commute, filtration, ventilation].map((item) => ({
    ...item,
    color: tone(item.status),
  }));
}

// Quick-pick featured cities for immediate observatory exploration
export const FEATURED_CITIES = [
  { state: 'Delhi',       city: 'Delhi',     region: 'NCR' },
  { state: 'Maharashtra', city: 'Mumbai',    region: 'West' },
  { state: 'Karnataka',   city: 'Bengaluru', region: 'South' },
  { state: 'West Bengal', city: 'Kolkata',   region: 'East' },
  { state: 'Maharashtra', city: 'Pune',      region: 'West' },
  { state: 'Rajasthan',   city: 'Jaipur',    region: 'North' },
];

// Indian states & cities (complete 293-city CPCB taxonomy preserved intact)
export const INDIA_DATA = {
  "Andaman and Nicobar Islands": ["Sri Vijaya Puram"],
  "Andhra Pradesh": ["Amaravati", "Anantapur", "Chittoor", "Kadapa", "Rajamahendravaram", "Tirumala", "Tirupati", "Vijayawada", "Visakhapatnam"],
  "Arunachal Pradesh": ["Naharlagun"],
  "Assam": ["Byrnihat", "Guwahati", "Nagaon", "Nalbari", "Silchar", "Sivasagar"],
  "Bihar": ["Araria", "Arrah", "Aurangabad", "Begusarai", "Bettiah", "Bhagalpur", "Bihar Sharif", "Buxar", "Chhapra", "Darbhanga", "Gaya", "Hajipur", "Katihar", "Kishanjganj", "Manguraha", "Motihari", "Munger", "Muzaffarpur", "Patna", "Purnia", "Rajgir", "Saharsa", "Samastipur", "Sasaram", "Siwan"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Bhilai", "Bilaspur", "Chhal", "Korba", "Kunjemura", "Milupara", "Raipur", "Tumidih"],
  "Delhi": ["Delhi"],
  "Gujarat": ["Ahmedabad", "Ankleshwar", "Gandhi Nagar", "Nandesari", "Surat", "Vapi", "Vatva"],
  "Haryana": ["Ambala", "Bahadurgarh", "Ballabgarh", "Bhiwani", "Charkhi Dadri", "Dharuhera", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mandikhera", "Manesar", "Narnaul", "Palwal", "Panchgaon", "Panchkula", "Panipat", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Baddi"],
  "Jammu and Kashmir": ["Srinagar"],
  "Jharkhand": ["Dhanbad", "Jorapokhar", "Pathardih"],
  "Karnataka": ["Bagalkot", "Belgaum", "Bengaluru", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Hubballi", "Kalaburagi", "Karwar", "Kolar", "Koppal", "Madikeri", "Mangalore", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura", "Yadgir"],
  "Kerala": ["Eloor", "Ernakulam", "Kannur", "Kochi", "Kollam", "Kozhikode", "Thiruvananthapuram", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Damoh", "Dewas", "Gwalior", "Indore", "Jabalpur", "Katni", "Maihar", "Mandideep", "Pithampur", "Ratlam", "Sagar", "Satna", "Singrauli", "Ujjain"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Badlapur", "Belapur", "Bhiwandi", "Boisar", "Chandrapur", "Dhule", "Jalgaon", "Jalna", "Kalyan", "Kolhapur", "Latur", "Mahad", "Malegaon", "Mira Bhayandar", "Mumbai", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Parbhani", "Pimpri Chinchwad", "Pune", "Sangli", "Solapur", "Thane", "Ulhasnagar", "Virar"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima"],
  "Odisha": ["Angul", "Balasore", "Barbil", "Baripada", "Bhubaneswar", "Bileipada", "Brajrajnagar", "Byasanagar", "Cuttack", "Keonjhar", "Nayagarh", "Rairangpur", "Rourkela", "Suakati", "Talcher", "Tensa"],
  "Puducherry": ["Puducherry"],
  "Punjab": ["Amritsar", "Bathinda", "Jalandhar", "Khanna", "Ludhiana", "Mandi Gobindgarh", "Patiala", "Rupnagar"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bhiwadi", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dindigul", "Gummidipoondi", "Hosur", "Kanchipuram", "Karur", "Madurai", "Nagapattinam", "Namakkal", "Ooty", "Palkalaiperur", "Pudukottai", "Ramanathapuram", "Ranipet", "Salem", "Thanjavur", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Vellore", "Virudhunagar"],
  "Telangana": ["Hyderabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Agra", "Baghpat", "Bareilly", "Bulandshahr", "Firozabad", "Ghaziabad", "Gorakhpur", "Greater Noida", "Hapur", "Jhansi", "Kanpur", "Khurja", "Lucknow", "Meerut", "Moradabad", "Muzaffarnagar", "NOIDA", "Prayagraj", "Varanasi", "Vrindavan"],
  "Uttarakhand": ["Dehradun", "Kashipur", "Rishikesh"],
  "West Bengal": ["Asansol", "Barrackpore", "Durgapur", "Haldia", "Howrah", "Kolkata", "Siliguri"]
};

// Pre-indexed flat list of all cities for instant <1ms search across 293 stations
export const ALL_CITIES_INDEX = Object.entries(INDIA_DATA)
  .flatMap(([state, cities]) =>
    cities.map((city) => ({
      state,
      city,
      searchKey: `${city} ${state}`.toLowerCase(),
    }))
  )
  .sort((a, b) => a.city.localeCompare(b.city));

// Model calibration & dataset ledger metrics
export const footerStats = [
  { value: '293',       label: 'Cities Tracked',  note: 'Across 32 states & UTs' },
  { value: '4,14,964',  label: 'Data Records',    note: 'Daily CPCB bulletins' },
  { value: '2022–2025', label: 'Training Span',   note: 'Multi-season history' },
  { value: 'XGBoost',   label: 'Forecast Model',  note: 'Autoregressive tree ensemble' },
  { value: '0.8387',    label: 'R² Accuracy',     note: 'Held-out validation' },
  { value: '13.642',    label: 'MAE Score',       note: 'Mean absolute AQI error' },
];
