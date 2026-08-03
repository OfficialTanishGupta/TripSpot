// Photos are from Picsum (a free, no-key placeholder photo service) seeded by
// destination name for visual consistency between reloads. They're real
// photographs, but not verified pictures of these exact places - swap in a
// Pexels API key (see README) for true destination-specific photography.

import img1 from "../assets/image1.jpg";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image3.jpg";
import img4 from "../assets/image4.jpg";
import img5 from "../assets/image5.jpg";
import img6 from "../assets/image6.jpg";
import img7 from "../assets/image7.jpg";
import img8 from "../assets/image8.jpg";
import img9 from "../assets/image9.jpg";
import img10 from "../assets/image10.jpg";
import img11 from "../assets/image11.jpg";

const photo = (seed, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const HERO_PHOTOS = [
  photo("india-taj-mahal", 1200, 1400),
  photo("india-kerala-backwaters", 1200, 1400),
  photo("india-rajasthan-fort", 1200, 1400),
  photo("india-himalayas", 1200, 1400),
];

export const MARQUEE_COLUMNS = [
  [img8, img2, img7, img1, img10, img3, img1, img7, img11], // Column 1
  [img10, img1, img10, img6, img7, img9, img5, img2, img9], // Column 2
  [img5, img4, img11, img8, img2, img11, img6, img3, img8], // Column 3
  [img9, img6, img3, img9, img5, img8, img4, img10, img6], // Column 4
];

export const POPULAR_ROUTES = [
  {
    from: "Lucknow",
    to: "Delhi",
    priceFrom: 480,
    accent: "#4F9DFF",
    photo: photo("lucknow-delhi", 500, 360),
  },
  {
    from: "Mumbai",
    to: "Goa",
    priceFrom: 890,
    accent: "#34E0A1",
    photo: photo("mumbai-goa", 500, 360),
  },
  {
    from: "Bengaluru",
    to: "Chennai",
    priceFrom: 550,
    accent: "#8B7CFF",
    photo: photo("bengaluru-chennai", 500, 360),
  },
  {
    from: "Delhi",
    to: "Jaipur",
    priceFrom: 410,
    accent: "#FFB84D",
    photo: photo("delhi-jaipur", 500, 360),
  },
  {
    from: "Kolkata",
    to: "Darjeeling",
    priceFrom: 690,
    accent: "#FF6FA5",
    photo: photo("kolkata-darjeeling", 500, 360),
  },
  {
    from: "Kochi",
    to: "Munnar",
    priceFrom: 340,
    accent: "#34E0A1",
    photo: photo("kochi-munnar", 500, 360),
  },
];

export const DESTINATION_GALLERY = [
  {
    name: "Taj Mahal, Agra",
    tag: "Heritage",
    photo: photo("agra-taj", 700, 500),
  },
  {
    name: "Kerala Backwaters",
    tag: "Nature",
    photo: photo("kerala-backwaters-2", 700, 500),
  },
  {
    name: "Jaipur, Rajasthan",
    tag: "Culture",
    photo: photo("jaipur-2", 700, 500),
  },
  { name: "Goa Beaches", tag: "Coast", photo: photo("goa-beach-2", 700, 500) },
  { name: "Ladakh", tag: "Mountains", photo: photo("ladakh-2", 700, 500) },
  {
    name: "Varanasi Ghats",
    tag: "Spiritual",
    photo: photo("varanasi-2", 700, 500),
  },
];

export const STORY_SLIDES = [
  {
    src: photo("travelhub-depart-2", 900, 1200),
    eyebrow: "STEP 1",
    caption: "You leave home not knowing which ride makes sense.",
  },
  {
    src: photo("travelhub-compare-2", 900, 1200),
    eyebrow: "STEP 2",
    caption: "One search lines up every cab, train, bus and flight.",
  },
  {
    src: photo("travelhub-arrive-2", 900, 1200),
    eyebrow: "STEP 3",
    caption: "TripSpot learns how you travel and ranks fares for you.",
  },
];

export const SAMPLE_RESULTS = [
  {
    id: "s1",
    mode: "TRAIN",
    providerName: "AC 3-Tier (3A)",
    origin: "Lucknow",
    destination: "Delhi",
    departureTime: "22:10",
    arrivalTime: "06:40",
    durationLabel: "8h 30m",
    price: 890,
    rating: 4.2,
    badge: "Cheapest",
    personalizedScore: 0.71,
  },
  {
    id: "s2",
    mode: "BUS",
    providerName: "VRL Travels",
    origin: "Lucknow",
    destination: "Delhi",
    departureTime: "21:00",
    arrivalTime: "07:15",
    durationLabel: "10h 15m",
    price: 1050,
    rating: 4.0,
    badge: null,
    personalizedScore: 0.41,
  },
  {
    id: "s3",
    mode: "FLIGHT",
    providerName: "IndiGo",
    origin: "Lucknow",
    destination: "Delhi",
    departureTime: "06:30",
    arrivalTime: "07:45",
    durationLabel: "1h 15m",
    price: 3200,
    rating: 4.4,
    badge: "Fastest",
    personalizedScore: 0.22,
  },
  {
    id: "s4",
    mode: "CAB",
    providerName: "Ola",
    origin: "Lucknow",
    destination: "Delhi",
    departureTime: "On demand",
    arrivalTime: "—",
    durationLabel: "7h 40m",
    price: 5400,
    rating: 4.1,
    badge: null,
    personalizedScore: 0.09,
  },
];

export const SAMPLE_BOOKINGS = [
  {
    id: "b1",
    mode: "TRAIN",
    providerName: "AC 3-Tier (3A)",
    origin: "Lucknow",
    destination: "Delhi",
    departureTime: "Fri, 25 Jul · 22:10",
    price: 890,
    status: "CONFIRMED",
  },
  {
    id: "b2",
    mode: "FLIGHT",
    providerName: "Vistara",
    origin: "Delhi",
    destination: "Bengaluru",
    departureTime: "Tue, 12 Aug · 09:15",
    price: 4650,
    status: "CONFIRMED",
  },
  {
    id: "b3",
    mode: "BUS",
    providerName: "Orange Tours",
    origin: "Pune",
    destination: "Mumbai",
    departureTime: "Sat, 2 Aug · 18:30",
    price: 620,
    status: "CANCELLED",
  },
];

export const SAMPLE_NOTIFICATIONS = [
  {
    id: "n1",
    type: "price",
    title: "Fare drop on Lucknow → Delhi",
    body: "Train fares fell 12% for your saved route.",
    time: "2h ago",
  },
  {
    id: "n2",
    type: "booking",
    title: "Booking confirmed",
    body: "Your Vistara flight to Bengaluru is confirmed.",
    time: "1d ago",
  },
  {
    id: "n3",
    type: "security",
    title: "New device signed in",
    body: "A sign-in from a new device was verified with your password.",
    time: "3d ago",
  },
];

export const FAQS = [
  {
    q: "How does TripSpot personalize my results?",
    a: "A trained model looks at your trip history — group size, frequency, price sensitivity, preferred mode — and re-ranks the fare board to match how you actually travel, not just by price.",
  },
  {
    q: "Is the fingerprint login required?",
    a: "No — it\u2019s entirely optional. Email and password always work. You can turn fingerprint sign-in on or off anytime from Settings.",
  },
  {
    q: "Which devices support fingerprint sign-in?",
    a: "Any device with a built-in fingerprint reader, Face ID, or Windows Hello — it uses your device\u2019s own biometric hardware.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes, from the Bookings page. Refund timelines depend on the operator\u2019s own cancellation policy.",
  },
];

export const SAMPLE_PERSONA = {
  persona: "Weekend Explorer",
  confidence: 0.86,
  insight:
    "You travel in small groups, mostly on weekends — TripSpot highlights well-rated options that suit a short getaway.",
};
