// ============================================================
// AIRSIGHT INDIA — Mock Data, States/Cities, Prediction Logic
// ============================================================

// ── AQI level metadata ──────────────────────────────────────
export const getAQILevel = (aqi) => {
  if (aqi <= 50)  return { label: 'GOOD',      color: '#10b981', glow: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)',  text: 'Air quality is satisfactory.' };
  if (aqi <= 100) return { label: 'MODERATE',  color: '#f59e0b', glow: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', text: 'Acceptable, but sensitive groups may be affected.' };
  if (aqi <= 200) return { label: 'POOR',       color: '#f97316', glow: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)', text: 'Unhealthy for sensitive groups. Limit outdoor exposure.' };
  if (aqi <= 300) return { label: 'VERY POOR',  color: '#ef4444', glow: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)',  text: 'Health effects for everyone. Avoid outdoor activity.' };
  return           { label: 'HAZARDOUS',  color: '#a855f7', glow: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', text: 'Emergency conditions. Stay indoors.' };
};

// ── Indian states & cities ───────────────────────────────────
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

// ── Base AQI per city (realistic approximations) ─────────────
const CITY_BASE_AQI = {
  // Delhi NCR
  'Delhi': 295, 'New Delhi': 288, 'Dwarka': 278, 'Rohini': 302,
  // UP
  'Lucknow': 218, 'Kanpur': 242, 'Noida': 261, 'Ghaziabad': 275, 'Agra': 235, 'Varanasi': 228, 'Meerut': 248,
  // Maharashtra
  'Mumbai': 138, 'Pune': 118, 'Nagpur': 148, 'Nashik': 122, 'Aurangabad': 132,
  // Bihar
  'Patna': 225, 'Gaya': 215, 'Muzaffarpur': 208, 'Bhagalpur': 195,
  // West Bengal
  'Kolkata': 188, 'Howrah': 198, 'Asansol': 205, 'Durgapur': 210,
  // Rajasthan
  'Jaipur': 172, 'Jodhpur': 158, 'Udaipur': 142, 'Kota': 168, 'Ajmer': 155,
  // Punjab
  'Amritsar': 182, 'Ludhiana': 175, 'Jalandhar': 168, 'Patiala': 162,
  // Haryana
  'Gurugram': 252, 'Faridabad': 265, 'Panipat': 238, 'Ambala': 215,
  // Gujarat
  'Ahmedabad': 165, 'Surat': 148, 'Vadodara': 158, 'Rajkot': 142,
  // MP
  'Bhopal': 155, 'Indore': 148, 'Jabalpur': 162, 'Gwalior': 188,
  // Karnataka
  'Bengaluru': 112, 'Mysuru': 98, 'Mangaluru': 88, 'Hubballi': 118,
  // Tamil Nadu
  'Chennai': 102, 'Coimbatore': 95, 'Madurai': 108, 'Salem': 112,
  // Telangana
  'Hyderabad': 128, 'Warangal': 118, 'Nizamabad': 125, 'Karimnagar': 115,
  // Andhra Pradesh
  'Visakhapatnam': 108, 'Vijayawada': 132, 'Tirupati': 98, 'Guntur': 122,
  // Odisha
  'Bhubaneswar': 118, 'Cuttack': 128, 'Rourkela': 145, 'Brahmapur': 112,
};

// ── Mock prediction function ─────────────────────────────────
// Props-driven: replace this with real API call later
export const mockPredict = (state, city, dateStr) => {
  const base = CITY_BASE_AQI[city] || 180;

  // Date offset: further future → slightly higher
  const today = new Date();
  const selected = new Date(dateStr);
  const daysDiff = Math.max(0, Math.round((selected - today) / (1000 * 60 * 60 * 24)));
  const dateNoise = daysDiff * 1.5;

  // Random variation ±15
  const noise = Math.round((Math.random() - 0.5) * 30);
  const liveAqi = Math.round(Math.min(500, Math.max(20, base + Math.round((Math.random() - 0.5) * 20))));
  const aqi = Math.round(Math.min(500, Math.max(20, base + dateNoise + noise)));
  const aqiChange = aqi - liveAqi;

  // Derived health metrics (based on predicted AQI)
  const cigarettes = Math.max(1, Math.round((aqi / 22)));
  const lungStress = Math.min(98, Math.round((aqi / 500) * 100));
  const riskScore = Math.min(10, parseFloat(((aqi / 500) * 10).toFixed(1)));

  // 7-day forecast (today + 7 days)
  const forecast = Array.from({ length: 8 }, (_, i) => {
    if (i === 0) {
      return { label: 'Today', aqi: liveAqi, isLive: true };
    }
    const variation = Math.round((Math.random() - 0.45) * 40);
    return {
      label: `+${i}d`,
      aqi: Math.round(Math.min(500, Math.max(20, aqi + variation + i * 1.2))),
      isLive: false,
    };
  });

  return { aqi, liveAqi, aqiChange, cigarettes, lungStress, riskScore, forecast, city, state, date: dateStr };
};

// ── Footer stats ─────────────────────────────────────────────
export const footerStats = [
  { value: '293',        label: 'Cities Tracked' },
  { value: '4,14,964',  label: 'Data Records' },
  { value: '2022–2025', label: 'Dataset Range' },
  { value: 'XGBoost',   label: 'Forecast Model' },
  { value: 'R² 0.8387', label: 'Model Accuracy' },
  { value: '13.642',    label: 'MAE Score' },
];
