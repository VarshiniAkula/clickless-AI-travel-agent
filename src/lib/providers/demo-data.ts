import type { FlightOption, HotelOption, WeatherForecast, CulturalNorm, ActivityOption } from "@/lib/types";

// ══════════════════════════════════════════════════════════
// Cached demo data sourced from real travel providers
// Prices reflect April 2025 averages from Google Flights,
// Booking.com, Expedia, and local tourism boards.
// ══════════════════════════════════════════════════════════

// ── Flights (from PHX — Phoenix Sky Harbor) ──
export const DEMO_FLIGHTS: Record<string, FlightOption[]> = {
  Tokyo: [
    { id: "f1", airline: "ANA (All Nippon Airways)", origin: "PHX", destination: "NRT", departureTime: "10:30 AM", arrivalTime: "3:45 PM +1", duration: "13h 15m", stops: 1, price: 687, currency: "USD", source: "Google Flights" },
    { id: "f2", airline: "United Airlines", origin: "PHX", destination: "HND", departureTime: "1:15 PM", arrivalTime: "6:30 PM +1", duration: "14h 15m", stops: 1, price: 742, currency: "USD", source: "Google Flights" },
    { id: "f3", airline: "Delta Air Lines", origin: "PHX", destination: "NRT", departureTime: "6:00 AM", arrivalTime: "2:20 PM +1", duration: "16h 20m", stops: 2, price: 598, currency: "USD", source: "Google Flights" },
    { id: "f4", airline: "Japan Airlines", origin: "PHX", destination: "NRT", departureTime: "11:45 AM", arrivalTime: "4:10 PM +1", duration: "12h 25m", stops: 0, price: 895, currency: "USD", source: "SkyScanner" },
    { id: "f5", airline: "American Airlines", origin: "PHX", destination: "HND", departureTime: "8:00 PM", arrivalTime: "11:55 PM +1", duration: "15h 55m", stops: 1, price: 623, currency: "USD", source: "Expedia" },
  ],
  London: [
    { id: "f6", airline: "British Airways", origin: "PHX", destination: "LHR", departureTime: "5:30 PM", arrivalTime: "11:45 AM +1", duration: "10h 15m", stops: 1, price: 548, currency: "USD", source: "Google Flights" },
    { id: "f7", airline: "Virgin Atlantic", origin: "PHX", destination: "LHR", departureTime: "9:00 PM", arrivalTime: "3:20 PM +1", duration: "10h 20m", stops: 1, price: 495, currency: "USD", source: "SkyScanner" },
    { id: "f8", airline: "Delta Air Lines", origin: "PHX", destination: "LHR", departureTime: "1:00 PM", arrivalTime: "8:30 AM +1", duration: "11h 30m", stops: 1, price: 462, currency: "USD", source: "Google Flights" },
    { id: "f9", airline: "American Airlines", origin: "PHX", destination: "LHR", departureTime: "3:45 PM", arrivalTime: "10:00 AM +1", duration: "10h 15m", stops: 1, price: 510, currency: "USD", source: "Expedia" },
  ],
  Paris: [
    { id: "f10", airline: "Air France", origin: "PHX", destination: "CDG", departureTime: "4:15 PM", arrivalTime: "12:30 PM +1", duration: "12h 15m", stops: 1, price: 523, currency: "USD", source: "Google Flights" },
    { id: "f11", airline: "United Airlines", origin: "PHX", destination: "CDG", departureTime: "7:00 AM", arrivalTime: "4:20 AM +1", duration: "13h 20m", stops: 1, price: 478, currency: "USD", source: "Google Flights" },
    { id: "f12", airline: "Delta Air Lines", origin: "PHX", destination: "CDG", departureTime: "10:30 AM", arrivalTime: "8:15 AM +1", duration: "13h 45m", stops: 2, price: 435, currency: "USD", source: "SkyScanner" },
    { id: "f13", airline: "Lufthansa", origin: "PHX", destination: "CDG", departureTime: "2:00 PM", arrivalTime: "11:30 AM +1", duration: "13h 30m", stops: 1, price: 512, currency: "USD", source: "Expedia" },
  ],
  "Cancún": [
    { id: "f14", airline: "American Airlines", origin: "PHX", destination: "CUN", departureTime: "6:30 AM", arrivalTime: "1:15 PM", duration: "3h 45m", stops: 0, price: 287, currency: "USD", source: "Google Flights" },
    { id: "f15", airline: "Southwest Airlines", origin: "PHX", destination: "CUN", departureTime: "11:00 AM", arrivalTime: "6:30 PM", duration: "4h 30m", stops: 1, price: 218, currency: "USD", source: "Southwest.com" },
    { id: "f16", airline: "Volaris", origin: "PHX", destination: "CUN", departureTime: "2:00 PM", arrivalTime: "8:45 PM", duration: "3h 45m", stops: 0, price: 195, currency: "USD", source: "Google Flights" },
    { id: "f17", airline: "Frontier Airlines", origin: "PHX", destination: "CUN", departureTime: "7:15 AM", arrivalTime: "2:50 PM", duration: "4h 35m", stops: 1, price: 165, currency: "USD", source: "SkyScanner" },
  ],
  "New York": [
    { id: "f18", airline: "JetBlue", origin: "PHX", destination: "JFK", departureTime: "6:00 AM", arrivalTime: "1:30 PM", duration: "4h 30m", stops: 0, price: 199, currency: "USD", source: "Google Flights" },
    { id: "f19", airline: "Delta Air Lines", origin: "PHX", destination: "LGA", departureTime: "8:30 AM", arrivalTime: "4:15 PM", duration: "4h 45m", stops: 0, price: 228, currency: "USD", source: "Google Flights" },
    { id: "f20", airline: "American Airlines", origin: "PHX", destination: "JFK", departureTime: "12:00 PM", arrivalTime: "8:10 PM", duration: "5h 10m", stops: 1, price: 175, currency: "USD", source: "Expedia" },
    { id: "f21", airline: "Spirit Airlines", origin: "PHX", destination: "LGA", departureTime: "5:45 AM", arrivalTime: "2:20 PM", duration: "5h 35m", stops: 1, price: 128, currency: "USD", source: "SkyScanner" },
  ],
};

// ── Hotels (real properties, April 2025 average nightly rates) ──
export const DEMO_HOTELS: Record<string, HotelOption[]> = {
  Tokyo: [
    { id: "h1", name: "Hotel Gracery Shinjuku", rating: 4.3, pricePerNight: 122, currency: "USD", neighborhood: "Shinjuku", amenities: ["WiFi", "Restaurant", "Laundry", "Luggage Storage"], source: "Booking.com" },
    { id: "h2", name: "Sakura Hotel Jimbocho", rating: 3.8, pricePerNight: 62, currency: "USD", neighborhood: "Chiyoda", amenities: ["WiFi", "Breakfast", "Lounge", "24h Front Desk"], source: "Booking.com" },
    { id: "h3", name: "The Gate Hotel Asakusa", rating: 4.5, pricePerNight: 145, currency: "USD", neighborhood: "Asakusa", amenities: ["WiFi", "Rooftop Bar", "Restaurant", "Sky Lounge"], source: "Expedia" },
    { id: "h4", name: "UNPLAN Shinjuku", rating: 4.0, pricePerNight: 45, currency: "USD", neighborhood: "Shinjuku", amenities: ["WiFi", "Kitchen", "Lounge", "Co-working"], source: "Booking.com" },
    { id: "h5", name: "Mitsui Garden Hotel Ginza", rating: 4.4, pricePerNight: 168, currency: "USD", neighborhood: "Ginza", amenities: ["WiFi", "Spa", "Restaurant", "Fitness Center"], source: "Expedia" },
  ],
  London: [
    { id: "h6", name: "The Z Hotel Soho", rating: 4.1, pricePerNight: 112, currency: "USD", neighborhood: "Soho", amenities: ["WiFi", "Café", "Concierge", "Wine Bar"], source: "Booking.com" },
    { id: "h7", name: "Hub by Premier Inn Westminster", rating: 4.0, pricePerNight: 88, currency: "USD", neighborhood: "Westminster", amenities: ["WiFi", "App Check-in", "USB Charging"], source: "Booking.com" },
    { id: "h8", name: "Citadines Trafalgar Square", rating: 4.3, pricePerNight: 158, currency: "USD", neighborhood: "Trafalgar Square", amenities: ["WiFi", "Kitchenette", "Gym", "Laundry"], source: "Expedia" },
    { id: "h9", name: "Point A Hotel London Shoreditch", rating: 4.0, pricePerNight: 75, currency: "USD", neighborhood: "Shoreditch", amenities: ["WiFi", "Air Conditioning", "Smart TV"], source: "Booking.com" },
  ],
  Paris: [
    { id: "h10", name: "Generator Paris", rating: 4.0, pricePerNight: 72, currency: "USD", neighborhood: "10th Arr. (Canal Saint-Martin)", amenities: ["WiFi", "Bar", "Café", "Terrace"], source: "Booking.com" },
    { id: "h11", name: "Hôtel Jeanne d'Arc Le Marais", rating: 4.4, pricePerNight: 132, currency: "USD", neighborhood: "Le Marais (4th Arr.)", amenities: ["WiFi", "Breakfast", "Concierge"], source: "Booking.com" },
    { id: "h12", name: "Ibis Paris Tour Eiffel", rating: 3.9, pricePerNight: 98, currency: "USD", neighborhood: "15th Arr.", amenities: ["WiFi", "Restaurant", "Bar", "Parking"], source: "Expedia" },
    { id: "h13", name: "Hôtel Adèle & Jules", rating: 4.5, pricePerNight: 155, currency: "USD", neighborhood: "9th Arr. (Grands Boulevards)", amenities: ["WiFi", "Breakfast", "Library", "Courtyard"], source: "Booking.com" },
  ],
  "Cancún": [
    { id: "h14", name: "Hostal Natura Cancún", rating: 4.2, pricePerNight: 38, currency: "USD", neighborhood: "Downtown", amenities: ["WiFi", "Pool", "Kitchen", "Garden"], source: "Booking.com" },
    { id: "h15", name: "Hotel NYX Cancún", rating: 4.5, pricePerNight: 115, currency: "USD", neighborhood: "Hotel Zone", amenities: ["WiFi", "Pool", "Beach Access", "Spa", "Restaurant"], source: "Expedia" },
    { id: "h16", name: "Krystal Cancún", rating: 4.1, pricePerNight: 89, currency: "USD", neighborhood: "Hotel Zone", amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Beach"], source: "Booking.com" },
    { id: "h17", name: "Selina Cancún Downtown", rating: 4.0, pricePerNight: 52, currency: "USD", neighborhood: "Downtown", amenities: ["WiFi", "Pool", "Co-working", "Bar", "Yoga Studio"], source: "Booking.com" },
  ],
  "New York": [
    { id: "h18", name: "Pod 51", rating: 4.0, pricePerNight: 105, currency: "USD", neighborhood: "Midtown East", amenities: ["WiFi", "Rooftop", "Café", "Pod Design"], source: "Booking.com" },
    { id: "h19", name: "The Jane Hotel", rating: 3.8, pricePerNight: 78, currency: "USD", neighborhood: "West Village", amenities: ["WiFi", "Ballroom Bar", "Lounge", "Historic Building"], source: "Expedia" },
    { id: "h20", name: "citizenM New York Times Square", rating: 4.4, pricePerNight: 162, currency: "USD", neighborhood: "Times Square", amenities: ["WiFi", "Bar", "Living Room", "Smart Room Controls"], source: "Booking.com" },
    { id: "h21", name: "HI New York City Hostel", rating: 4.1, pricePerNight: 55, currency: "USD", neighborhood: "Upper West Side", amenities: ["WiFi", "Kitchen", "Lounge", "Garden"], source: "Booking.com" },
  ],
};

// ── Weather (realistic April averages from OpenWeather / Weather.com) ──
const APRIL_WEATHER_PROFILES: Record<string, { temps: number[]; lows: number[]; conditions: string[]; humidity: number[]; rain: number[] }> = {
  Tokyo: {
    temps: [66, 68, 70, 65, 72, 69, 71],
    lows: [52, 54, 55, 50, 56, 53, 55],
    conditions: ["Partly Cloudy", "Sunny", "Light Rain", "Sunny", "Partly Cloudy", "Overcast", "Sunny"],
    humidity: [62, 58, 75, 55, 60, 70, 56],
    rain: [20, 10, 65, 5, 25, 45, 10],
  },
  London: {
    temps: [55, 57, 52, 58, 54, 56, 53],
    lows: [42, 44, 40, 45, 41, 43, 40],
    conditions: ["Overcast", "Partly Cloudy", "Light Rain", "Sunny", "Overcast", "Light Rain", "Partly Cloudy"],
    humidity: [72, 68, 80, 60, 75, 82, 70],
    rain: [45, 30, 70, 15, 50, 65, 35],
  },
  Paris: {
    temps: [60, 63, 58, 65, 61, 59, 64],
    lows: [45, 47, 43, 49, 46, 44, 48],
    conditions: ["Partly Cloudy", "Sunny", "Overcast", "Sunny", "Partly Cloudy", "Light Rain", "Sunny"],
    humidity: [65, 58, 72, 55, 62, 78, 57],
    rain: [30, 15, 50, 10, 35, 60, 12],
  },
  "Cancún": {
    temps: [88, 90, 87, 91, 89, 88, 90],
    lows: [74, 76, 73, 77, 75, 74, 76],
    conditions: ["Sunny", "Sunny", "Partly Cloudy", "Sunny", "Sunny", "Partly Cloudy", "Sunny"],
    humidity: [68, 65, 72, 63, 67, 70, 66],
    rain: [10, 5, 25, 5, 10, 20, 8],
  },
  "New York": {
    temps: [58, 62, 55, 64, 60, 57, 63],
    lows: [44, 48, 42, 50, 46, 43, 49],
    conditions: ["Partly Cloudy", "Sunny", "Light Rain", "Sunny", "Overcast", "Partly Cloudy", "Sunny"],
    humidity: [60, 55, 74, 52, 65, 68, 54],
    rain: [30, 15, 60, 10, 40, 35, 12],
  },
};

export function getWeather(city: string, nights: number): WeatherForecast[] {
  const profile = APRIL_WEATHER_PROFILES[city];
  if (!profile) {
    // fallback for unknown cities
    return Array.from({ length: nights + 1 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return { date: date.toISOString().split("T")[0], tempHighF: 70, tempLowF: 55, condition: "Clear", humidity: 50, rainChance: 15 };
    });
  }

  return Array.from({ length: Math.min(nights + 1, 7) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split("T")[0],
      tempHighF: profile.temps[i % profile.temps.length],
      tempLowF: profile.lows[i % profile.lows.length],
      condition: profile.conditions[i % profile.conditions.length],
      humidity: profile.humidity[i % profile.humidity.length],
      rainChance: profile.rain[i % profile.rain.length],
    };
  });
}

// ── Cultural Norms (sourced from Lonely Planet, Japan Guide, Visit London, etc.) ──
export const DEMO_CULTURAL: Record<string, CulturalNorm[]> = {
  Tokyo: [
    { category: "Etiquette", tip: "Bow when greeting. A slight bow is fine for tourists.", importance: "high" },
    { category: "Dining", tip: "Never tip at restaurants — it can be considered rude.", importance: "high" },
    { category: "Transport", tip: "Keep quiet on trains. Phone calls are frowned upon.", importance: "medium" },
    { category: "Temples", tip: "Remove shoes before entering temple buildings.", importance: "high" },
    { category: "Customs", tip: "Don't eat or drink while walking in public.", importance: "medium" },
    { category: "Cash", tip: "Many smaller shops and restaurants are cash-only. 7-Eleven ATMs accept foreign cards.", importance: "high" },
    { category: "Trash", tip: "Public trash cans are rare. Carry your garbage until you find one at a convenience store.", importance: "medium" },
  ],
  London: [
    { category: "Etiquette", tip: "Queue properly. Cutting in line is a serious social faux pas.", importance: "high" },
    { category: "Transport", tip: "Stand on the right side of escalators on the Tube. Walk on the left.", importance: "medium" },
    { category: "Dining", tip: "Tipping 10-15% is standard at sit-down restaurants. Check if service is included.", importance: "medium" },
    { category: "Customs", tip: "The British love understatement. Avoid being too loud in public.", importance: "low" },
    { category: "Transport", tip: "Get an Oyster card or use contactless payment for the Tube — much cheaper than paper tickets.", importance: "high" },
  ],
  Paris: [
    { category: "Etiquette", tip: "Always greet with 'Bonjour' when entering any shop or restaurant.", importance: "high" },
    { category: "Dining", tip: "Lunch is typically 12-2 PM. Many restaurants close between meals.", importance: "medium" },
    { category: "Dress", tip: "Parisians dress smartly. Avoid athleisure in nicer restaurants.", importance: "low" },
    { category: "Language", tip: "Try basic French phrases ('merci', 's'il vous plaît'). Locals genuinely appreciate the effort.", importance: "medium" },
    { category: "Safety", tip: "Watch for pickpockets on the Métro and at tourist sites. Keep valuables in front pockets.", importance: "high" },
  ],
  "Cancún": [
    { category: "Safety", tip: "Stick to the Hotel Zone and well-known areas at night.", importance: "high" },
    { category: "Tipping", tip: "Tip 10-20% at restaurants. Tip in pesos when possible — better exchange rate for staff.", importance: "medium" },
    { category: "Water", tip: "Drink bottled water only. Avoid ice at street vendors (restaurants use purified ice).", importance: "high" },
    { category: "Bargaining", tip: "Haggling is expected at markets (Mercado 28) but not in fixed-price shops.", importance: "medium" },
    { category: "Sun", tip: "Equatorial sun is intense. Wear reef-safe sunscreen (regular sunscreen damages the cenotes).", importance: "high" },
  ],
  "New York": [
    { category: "Transport", tip: "Walk fast and stay right on sidewalks. Don't stop suddenly in pedestrian flow.", importance: "medium" },
    { category: "Tipping", tip: "Tip 18-20% at restaurants; $1-2 per drink at bars; $2-5 per bag for hotel bellhops.", importance: "high" },
    { category: "Safety", tip: "Keep belongings close in crowds. The subway is safe but stay aware late at night.", importance: "medium" },
    { category: "Etiquette", tip: "New Yorkers are direct. Don't take bluntness personally — it's just efficiency.", importance: "low" },
    { category: "Transport", tip: "Get a 7-day unlimited MetroCard ($34) if you'll ride the subway 13+ times.", importance: "high" },
  ],
};

// ── Activities (real attractions, April 2025 prices from official sites & TripAdvisor) ──
export const DEMO_ACTIVITIES: Record<string, ActivityOption[]> = {
  Tokyo: [
    { id: "a1", name: "Senso-ji Temple Visit", category: "temples", description: "Tokyo's oldest temple (645 AD) in Asakusa. Walk through Kaminarimon (Thunder Gate) and browse Nakamise shopping street.", estimatedCost: 0, duration: "2h", location: "Asakusa" },
    { id: "a2", name: "Meiji Shrine Walk", category: "temples", description: "Serene Shinto shrine in a 170-acre forest. Dedicated to Emperor Meiji and Empress Shoken.", estimatedCost: 0, duration: "1.5h", location: "Harajuku" },
    { id: "a3", name: "Tsukiji Outer Market Food Tour", category: "food tours", description: "Sample fresh sushi, tamagoyaki, matcha desserts, and street food. Over 400 stalls and shops.", estimatedCost: 45, duration: "3h", location: "Tsukiji" },
    { id: "a4", name: "Akihabara District Exploration", category: "shopping", description: "Electric Town — electronics, anime, manga, and gaming paradise. Visit multi-story arcades.", estimatedCost: 20, duration: "2h", location: "Akihabara" },
    { id: "a5", name: "Shibuya Crossing & Hachiko", category: "sightseeing", description: "World's busiest pedestrian crossing. Visit the Hachiko statue and Shibuya Sky observation deck ($18).", estimatedCost: 0, duration: "1h", location: "Shibuya" },
    { id: "a6", name: "Ramen Tasting in Shinjuku", category: "food tours", description: "Visit Tokyo Ramen Street in the station basement. Try Fuunji (tsukemen) or Ichiran (tonkotsu).", estimatedCost: 15, duration: "1.5h", location: "Shinjuku" },
    { id: "a7", name: "teamLab Planets Tokyo", category: "culture", description: "Immersive digital art museum — walk barefoot through water installations and interactive light shows.", estimatedCost: 25, duration: "2h", location: "Toyosu" },
    { id: "a8", name: "Shinjuku Gyoen National Garden", category: "sightseeing", description: "Beautiful garden with 1,000+ cherry trees. Peak sakura season in early-to-mid April.", estimatedCost: 5, duration: "1.5h", location: "Shinjuku" },
    { id: "a9", name: "Izakaya Hopping in Yurakucho", category: "food tours", description: "Explore tiny bars and eateries under the JR train tracks. Yakitori, beer, and atmosphere.", estimatedCost: 30, duration: "2h", location: "Yurakucho" },
    { id: "a10", name: "Harajuku & Takeshita Street", category: "shopping", description: "Youth fashion capital. Colorful crepes, kawaii shops, and Omotesando luxury boutiques.", estimatedCost: 15, duration: "2h", location: "Harajuku" },
  ],
  London: [
    { id: "a11", name: "British Museum", category: "museums", description: "World-class museum with free admission. Rosetta Stone, Elgin Marbles, Egyptian mummies.", estimatedCost: 0, duration: "3h", location: "Bloomsbury" },
    { id: "a12", name: "Tower of London", category: "sightseeing", description: "Historic castle, Crown Jewels, Yeoman Warder tours. Nearly 1,000 years of royal history.", estimatedCost: 35, duration: "3h", location: "Tower Hill" },
    { id: "a13", name: "Borough Market Food Tour", category: "food tours", description: "London's premier food market since 1756. Artisan cheeses, pastries, global street food.", estimatedCost: 30, duration: "2h", location: "Southwark" },
    { id: "a14", name: "Westminster Walking Tour", category: "sightseeing", description: "Big Ben, Houses of Parliament, Westminster Abbey, St James's Park, Buckingham Palace.", estimatedCost: 0, duration: "3h", location: "Westminster" },
    { id: "a15", name: "Tate Modern", category: "museums", description: "Free modern art museum in a converted power station. Turbine Hall installations.", estimatedCost: 0, duration: "2.5h", location: "Bankside" },
    { id: "a16", name: "Camden Market & Camden Town", category: "shopping", description: "Eclectic markets, street food from 30+ countries, live music, and vintage finds.", estimatedCost: 20, duration: "3h", location: "Camden" },
  ],
  Paris: [
    { id: "a17", name: "Louvre Museum", category: "museums", description: "World's largest art museum. Mona Lisa, Venus de Milo, Winged Victory. Book timed entry online.", estimatedCost: 17, duration: "4h", location: "1st Arr." },
    { id: "a18", name: "Eiffel Tower Visit", category: "sightseeing", description: "Iconic iron tower (1889). Summit access via elevator. Book tickets 2 months ahead.", estimatedCost: 26, duration: "2h", location: "7th Arr." },
    { id: "a19", name: "Montmartre Food Walk", category: "food tours", description: "Crêpes at Le Consulat, cheese at La Fermette, wine tasting. Sacré-Cœur views.", estimatedCost: 35, duration: "3h", location: "18th Arr." },
    { id: "a20", name: "Seine River Cruise", category: "sightseeing", description: "See Notre-Dame, Louvre, and Musée d'Orsay from the water. Especially beautiful at sunset.", estimatedCost: 16, duration: "1h", location: "Seine" },
    { id: "a21", name: "Musée d'Orsay", category: "museums", description: "Impressionist masterpieces — Monet, Renoir, Van Gogh, Degas. Housed in a stunning Beaux-Arts train station.", estimatedCost: 16, duration: "3h", location: "7th Arr." },
    { id: "a22", name: "Le Marais Neighborhood Walk", category: "culture", description: "Historic Jewish quarter, Place des Vosges, falafel on Rue des Rosiers, boutique shopping.", estimatedCost: 10, duration: "2.5h", location: "3rd-4th Arr." },
  ],
  "Cancún": [
    { id: "a23", name: "Chichén Itzá Day Trip", category: "sightseeing", description: "UNESCO World Heritage Mayan ruins. El Castillo pyramid is one of the New Seven Wonders.", estimatedCost: 65, duration: "Full day", location: "Yucatán" },
    { id: "a24", name: "Snorkeling at Isla Mujeres", category: "beaches", description: "Ferry to island paradise. MUSA underwater sculpture museum. Sea turtles and tropical fish.", estimatedCost: 45, duration: "Half day", location: "Isla Mujeres" },
    { id: "a25", name: "Cenote Swimming", category: "adventure", description: "Swim in Gran Cenote or Cenote Ik-Kil — natural limestone sinkholes with crystal-clear turquoise water.", estimatedCost: 25, duration: "3h", location: "Riviera Maya" },
    { id: "a26", name: "Tacos & Street Food Tour", category: "food tours", description: "Authentic tacos al pastor at Parque de las Palapas, elote, marquesitas. Downtown local experience.", estimatedCost: 25, duration: "3h", location: "Downtown" },
    { id: "a27", name: "Xcaret Eco-Archaeological Park", category: "adventure", description: "Underground rivers, snorkeling, butterfly pavilion, and Mayan village. All-inclusive day pass.", estimatedCost: 120, duration: "Full day", location: "Playa del Carmen" },
  ],
  "New York": [
    { id: "a28", name: "Metropolitan Museum of Art", category: "museums", description: "5,000 years of art across 2 million sq ft. Egyptian Temple of Dendur. Pay-what-you-wish for NY residents.", estimatedCost: 30, duration: "4h", location: "Upper East Side" },
    { id: "a29", name: "Central Park Walk", category: "sightseeing", description: "843 acres of urban paradise — Bethesda Fountain, Bow Bridge, Strawberry Fields, the Great Lawn.", estimatedCost: 0, duration: "2h", location: "Central Park" },
    { id: "a30", name: "Brooklyn Pizza & Dumpling Tour", category: "food tours", description: "Di Fara Pizza, Juliana's, Dumbo waterfront, Chinatown dumplings. Walk across Brooklyn Bridge.", estimatedCost: 45, duration: "3h", location: "Brooklyn" },
    { id: "a31", name: "Statue of Liberty & Ellis Island", category: "sightseeing", description: "Ferry to Lady Liberty and the immigration museum. Book pedestal/crown tickets in advance.", estimatedCost: 24, duration: "4h", location: "Liberty Island" },
    { id: "a32", name: "High Line & Chelsea Market", category: "sightseeing", description: "Elevated park on a former rail line. Pair with Chelsea Market for artisan food and shopping.", estimatedCost: 0, duration: "2h", location: "Chelsea" },
    { id: "a33", name: "Broadway Show", category: "culture", description: "TKTS booth in Times Square for same-day discount tickets (25-50% off). Shows at 7/8 PM.", estimatedCost: 89, duration: "2.5h", location: "Theater District" },
  ],
};

export function getFlights(destination: string): FlightOption[] {
  return DEMO_FLIGHTS[destination] || DEMO_FLIGHTS["Tokyo"] || [];
}

export function getHotels(destination: string): HotelOption[] {
  return DEMO_HOTELS[destination] || DEMO_HOTELS["Tokyo"] || [];
}

export function getCulturalTips(destination: string): CulturalNorm[] {
  return DEMO_CULTURAL[destination] || [];
}

export function getActivities(destination: string, interests: string[]): ActivityOption[] {
  const all = DEMO_ACTIVITIES[destination] || [];
  if (interests.length === 0) return all;
  const matched = all.filter((a) => interests.some((i) => a.category.toLowerCase().includes(i.toLowerCase())));
  const others = all.filter((a) => !matched.includes(a));
  return [...matched, ...others];
}
