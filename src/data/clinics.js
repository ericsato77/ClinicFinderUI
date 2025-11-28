export const clinics = [
  {
    id: 1,
    name: "City Health Center",
    address: "123 Main St, Downtown",
    distance: 1.2,
    rating: 4.5,
    reviewCount: 128,
    services: ["Primary Care", "Pediatrics", "Vaccination"],
    insurance: ["BlueCross", "Aetna", "Medicare"],
    hours: "Mon-Fri: 8am - 6pm",
    isOpen: true,
    coordinates: { lat: 40.7128, lng: -74.0060 },
    phone: "(555) 123-4567"
  },
  {
    id: 2,
    name: "Westside Urgent Care",
    address: "456 West Ave, Westside",
    distance: 3.5,
    rating: 4.2,
    reviewCount: 85,
    services: ["Urgent Care", "X-Ray", "Lab Services"],
    insurance: ["UnitedHealth", "Cigna", "Medicaid"],
    hours: "Mon-Sun: 7am - 10pm",
    isOpen: true,
    coordinates: { lat: 40.7300, lng: -74.0100 },
    phone: "(555) 987-6543"
  },
  {
    id: 3,
    name: "Family Dental Plus",
    address: "789 Oak Ln, Suburbia",
    distance: 5.0,
    rating: 4.8,
    reviewCount: 210,
    services: ["Dental", "Orthodontics"],
    insurance: ["Delta Dental", "MetLife", "Aetna"],
    hours: "Mon-Fri: 9am - 5pm",
    isOpen: false,
    coordinates: { lat: 40.7500, lng: -73.9900 },
    phone: "(555) 456-7890"
  },
  {
    id: 4,
    name: "Downtown Pediatrics",
    address: "101 Pine St, Downtown",
    distance: 0.8,
    rating: 4.9,
    reviewCount: 300,
    services: ["Pediatrics", "Vaccination"],
    insurance: ["BlueCross", "UnitedHealth"],
    hours: "Mon-Fri: 8am - 4pm",
    isOpen: true,
    coordinates: { lat: 40.7150, lng: -74.0080 },
    phone: "(555) 789-0123"
  },
  {
    id: 5,
    name: "Community Hospital ER",
    address: "500 Hospital Way",
    distance: 8.2,
    rating: 3.8,
    reviewCount: 56,
    services: ["Emergency", "Surgery", "Inpatient"],
    insurance: ["All"],
    hours: "24/7",
    isOpen: true,
    coordinates: { lat: 40.7600, lng: -73.9800 },
    phone: "(555) 000-1111"
  },
  {
    id: 6,
    name: "Sunrise Dermatology",
    address: "202 Sun Blvd",
    distance: 12.5,
    rating: 4.6,
    reviewCount: 92,
    services: ["Dermatology", "Cosmetic"],
    insurance: ["Cigna", "Medicare"],
    hours: "Mon-Thu: 9am - 5pm",
    isOpen: false,
    coordinates: { lat: 40.7800, lng: -73.9500 },
    phone: "(555) 222-3333"
  },
  {
    id: 7,
    name: "Vision Care Specialists",
    address: "303 Eye Ct",
    distance: 4.1,
    rating: 4.7,
    reviewCount: 150,
    services: ["Optometry", "Ophthalmology"],
    insurance: ["VSP", "EyeMed", "Aetna"],
    hours: "Mon-Sat: 10am - 6pm",
    isOpen: true,
    coordinates: { lat: 40.7200, lng: -74.0200 },
    phone: "(555) 444-5555"
  },
  {
    id: 8,
    name: "Mental Health Partners",
    address: "404 Mind Ln",
    distance: 2.3,
    rating: 4.4,
    reviewCount: 75,
    services: ["Psychiatry", "Therapy"],
    insurance: ["BlueCross", "Magellan"],
    hours: "Mon-Fri: 8am - 8pm",
    isOpen: true,
    coordinates: { lat: 40.7400, lng: -74.0300 },
    phone: "(555) 666-7777"
  },
  {
    id: 9,
    name: "OrthoPro Clinic",
    address: "505 Bone Blvd",
    distance: 6.7,
    rating: 4.3,
    reviewCount: 110,
    services: ["Orthopedics", "Physical Therapy"],
    insurance: ["UnitedHealth", "WorkersComp"],
    hours: "Mon-Fri: 7am - 7pm",
    isOpen: true,
    coordinates: { lat: 40.7700, lng: -73.9600 },
    phone: "(555) 888-9999"
  },
  {
    id: 10,
    name: "Women's Wellness Center",
    address: "606 Rose Way",
    distance: 3.0,
    rating: 4.9,
    reviewCount: 220,
    services: ["OB/GYN", "Women's Health"],
    insurance: ["Aetna", "Cigna", "BlueCross"],
    hours: "Mon-Fri: 9am - 5pm",
    isOpen: false,
    coordinates: { lat: 40.7350, lng: -74.0150 },
    phone: "(555) 111-2222"
  }
];

export const serviceOptions = [
  "Primary Care", "Dental", "Emergency", "Urgent Care", 
  "Pediatrics", "Dermatology", "Optometry", "Psychiatry", 
  "Orthopedics", "OB/GYN"
];

export const insuranceOptions = [
  "BlueCross", "Aetna", "UnitedHealth", "Cigna", 
  "Medicare", "Medicaid", "Delta Dental"
];
