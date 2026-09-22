// src/data/districtData.ts
// Comprehensive mapping of Indian States & Union Territories to their Districts

export const districtMap: Record<string, string[]> = {
  "Maharashtra": [
    "Nashik", "Pune", "Nagpur", "Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad",
    "Aurangabad (Chhatrapati Sambhajinagar)", "Solapur", "Kolhapur", "Satara", "Ahmednagar",
    "Amravati", "Nanded", "Jalgaon", "Latur", "Dhule", "Chandrapur", "Yavatmal", "Sangli"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar",
    "Bharuch", "Anand", "Kheda", "Kutch", "Mehsana", "Amreli", "Junagadh", "Valsad", "Navsari"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur Nagar", "Varanasi", "Agra", "Noida (Gautam Buddha Nagar)", "Ghaziabad",
    "Gorakhpur", "Prayagraj (Allahabad)", "Bareilly", "Aligarh", "Moradabad", "Saharanpur",
    "Jhansi", "Ayodhya", "Mathura", "Meerut", "Muzaffarnagar"
  ],
  "Karnataka": [
    "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru (Dakshina Kannada)", "Belagavi",
    "Hubballi-Dharwad", "Kalaburagi", "Tumakuru", "Shivamogga", "Ballari", "Udupi", "Hassan"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode",
    "Vellore", "Thanjavur", "Kanchipuram", "Chengalpattu", "Cuddalore", "Tiruppur"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar",
    "Bharatpur", "Sikar", "Pali", "Chittorgarh"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna",
    "Ratlam", "Singrauli", "Chhindwara"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada (NTR)", "Guntur", "Tirupati", "Nellore", "Kakinada",
    "Kurnool", "Rajahmundry", "Anantapur", "Eluru"
  ],
  "Telangana": [
    "Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Warangal", "Nizamabad", "Khammam",
    "Karimnagar", "Nalgonda", "Sangareddy"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly", "Paschim Bardhaman",
    "Purba Bardhaman", "Darjeeling", "Jalpaiguri", "Siliguri", "Murshidabad"
  ],
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas", "Begusarai",
    "Nalanda", "Saran"
  ],
  "Odisha": [
    "Khurda (Bhubaneswar)", "Cuttack", "Ganjam", "Sundargarh (Rourkela)", "Sambalpur",
    "Puri", "Balasore", "Bhadrak", "Jharsuguda", "Angul", "Jajpur"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "SAS Nagar (Mohali)", "Bathinda",
    "Pathankot", "Hoshiarpur", "Gurdaspur"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak",
    "Sonipat", "Panchkula", "Yamunanagar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Thrissur", "Kollam",
    "Kannur", "Kottayam", "Palakkad", "Malappuram"
  ],
  "Assam": [
    "Kamrup Metropolitan (Guwahati)", "Dibrugarh", "Silchar (Cachar)", "Jorhat",
    "Nagaon", "Tinsukia", "Tezpur (Sonitpur)", "Cachar"
  ],
  "Jharkhand": [
    "Ranchi", "East Singhbhum (Jamshedpur)", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Pauri Garhwal"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Mandi", "Kangra (Dharamshala)", "Solan", "Sirmaur"
  ],
  "Goa": [
    "North Goa (Panaji)", "South Goa (Margao)"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur"
  ],
  "Delhi (UT)": [
    "New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"
  ],
  "Chandigarh (UT)": ["Chandigarh"],
  "Puducherry (UT)": ["Puducherry", "Karaikal"],
  "Ladakh (UT)": ["Leh", "Kargil"]
};

export const ALL_INDIAN_STATES = Object.keys(districtMap);

export function getDistrictsForState(stateName: string): string[] {
  if (!stateName || stateName === "All States") {
    return Array.from(new Set(Object.values(districtMap).flat())).sort();
  }
  return districtMap[stateName] || ["District 1", "District 2", "District 3"];
}
