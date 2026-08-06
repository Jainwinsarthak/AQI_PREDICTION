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

// ── Footer stats ─────────────────────────────────────────────
export const footerStats = [
  { value: '293',        label: 'Cities Tracked' },
  { value: '4,14,964',  label: 'Data Records' },
  { value: '2022–2025', label: 'Dataset Range' },
  { value: 'XGBoost',   label: 'Forecast Model' },
  { value: 'R² 0.8387', label: 'Best R² (80/20 Split)' },
  { value: '13.64',     label: 'Best MAE Score' },
];
