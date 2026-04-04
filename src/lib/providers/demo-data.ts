import type { FlightOption, HotelOption, WeatherForecast, CulturalNorm, ActivityOption } from "@/lib/types";

// ── Flights ──
export const DEMO_FLIGHTS: Record<string, FlightOption[]> = {
  Tokyo: [
    { id: "f1", airline: "ANA", origin: "PHX", destination: "NRT", departureTime: "10:30 AM", arrivalTime: "3:45 PM +1", duration: "13h 15m", stops: 1, price: 685, currency: "USD", source: "demo" },
    { id: "f2", airline: "United Airlines", origin: "PHX", destination: "HND", departureTime: "1:15 PM", arrivalTime: "6:30 PM +1", duration: "14h 15m", stops: 1, price: 742, currency: "USD", source: "demo" },
    { id: "f3", airline: "Delta", origin: "PHX", destination: "NRT", departureTime: "6:00 AM", arrivalTime: "2:20 PM +1", duration: "16h 20m", stops: 2, price: 598, currency: "USD", source: "demo" },
    { id: "f4", airline: "Japan Airlines", origin: "PHX", destination: "NRT", departureTime: "11:45 AM", arrivalTime: "4:10 PM +1", duration: "12h 25m", stops: 0, price: 892, currency: "USD", source: "demo" },
    { id: "f5", airline: "American Airlines", origin: "PHX", destination: "HND", departureTime: "8:00 PM", arrivalTime: "11:55 PM +1", duration: "15h 55m", stops: 1, price: 623, currency: "USD", source: "demo" },
  ],
  London: [
    { id: "f6", airline: "British Airways", origin: "PHX", destination: "LHR", departureTime: "5:30 PM", arrivalTime: "11:45 AM +1", duration: "10h 15m", stops: 1, price: 545, currency: "USD", source: "demo" },
    { id: "f7", airline: "Virgin Atlantic", origin: "PHX", destination: "LHR", departureTime: "9:00 PM", arrivalTime: "3:20 PM +1", duration: "10h 20m", stops: 1, price: 498, currency: "USD", source: "demo" },
    { id: "f8", airline: "Delta", origin: "PHX", destination: "LHR", departureTime: "1:00 PM", arrivalTime: "8:30 AM +1", duration: "11h 30m", stops: 1, price: 462, currency: "USD", source: "demo" },
  ],
  Paris: [
    { id: "f9", airline: "Air France", origin: "PHX", destination: "CDG", departureTime: "4:15 PM", arrivalTime: "12:30 PM +1", duration: "12h 15m", stops: 1, price: 520, currency: "USD", source: "demo" },
    { id: "f10", airline: "United Airlines", origin: "PHX", destination: "CDG", departureTime: "7:00 AM", arrivalTime: "4:20 AM +1", duration: "13h 20m", stops: 1, price: 478, currency: "USD", source: "demo" },
    { id: "f11", airline: "Delta", origin: "PHX", destination: "CDG", departureTime: "10:30 AM", arrivalTime: "8:15 AM +1", duration: "13h 45m", stops: 2, price: 435, currency: "USD", source: "demo" },
  ],
  "Cancún": [
    { id: "f12", airline: "American Airlines", origin: "PHX", destination: "CUN", departureTime: "6:30 AM", arrivalTime: "1:15 PM", duration: "3h 45m", stops: 0, price: 285, currency: "USD", source: "demo" },
    { id: "f13", airline: "Southwest", origin: "PHX", destination: "CUN", departureTime: "11:00 AM", arrivalTime: "6:30 PM", duration: "4h 30m", stops: 1, price: 218, currency: "USD", source: "demo" },
    { id: "f14", airline: "Volaris", origin: "PHX", destination: "CUN", departureTime: "2:00 PM", arrivalTime: "8:45 PM", duration: "3h 45m", stops: 0, price: 195, currency: "USD", source: "demo" },
  ],
  "New York": [
    { id: "f15", airline: "JetBlue", origin: "PHX", destination: "JFK", departureTime: "6:00 AM", arrivalTime: "1:30 PM", duration: "4h 30m", stops: 0, price: 198, currency: "USD", source: "demo" },
    { id: "f16", airline: "Delta", origin: "PHX", destination: "LGA", departureTime: "8:30 AM", arrivalTime: "4:15 PM", duration: "4h 45m", stops: 0, price: 225, currency: "USD", source: "demo" },
    { id: "f17", airline: "American Airlines", origin: "PHX", destination: "JFK", departureTime: "12:00 PM", arrivalTime: "8:10 PM", duration: "5h 10m", stops: 1, price: 175, currency: "USD", source: "demo" },
  ],
};

// ── Hotels ──
export const DEMO_HOTELS: Record<string, HotelOption[]> = {
  Tokyo: [
    { id: "h1", name: "Hotel Gracery Shinjuku", rating: 4.3, pricePerNight: 120, currency: "USD", neighborhood: "Shinjuku", amenities: ["WiFi", "Restaurant", "Laundry"], source: "demo" },
    { id: "h2", name: "Sakura Hotel Jimbocho", rating: 3.8, pricePerNight: 65, currency: "USD", neighborhood: "Chiyoda", amenities: ["WiFi", "Breakfast", "Lounge"], source: "demo" },
    { id: "h3", name: "The Gate Hotel Asakusa", rating: 4.5, pricePerNight: 145, currency: "USD", neighborhood: "Asakusa", amenities: ["WiFi", "Rooftop Bar", "Restaurant"], source: "demo" },
    { id: "h4", name: "UNPLAN Shinjuku", rating: 4.0, pricePerNight: 45, currency: "USD", neighborhood: "Shinjuku", amenities: ["WiFi", "Kitchen", "Lounge"], source: "demo" },
  ],
  London: [
    { id: "h5", name: "The Z Hotel Soho", rating: 4.1, pricePerNight: 110, currency: "USD", neighborhood: "Soho", amenities: ["WiFi", "Café", "Concierge"], source: "demo" },
    { id: "h6", name: "Hub by Premier Inn Westminster", rating: 4.0, pricePerNight: 85, currency: "USD", neighborhood: "Westminster", amenities: ["WiFi", "App Check-in"], source: "demo" },
    { id: "h7", name: "Citadines Trafalgar Square", rating: 4.3, pricePerNight: 155, currency: "USD", neighborhood: "Trafalgar Square", amenities: ["WiFi", "Kitchen", "Gym"], source: "demo" },
  ],
  Paris: [
    { id: "h8", name: "Generator Paris", rating: 4.0, pricePerNight: 70, currency: "USD", neighborhood: "10th Arr.", amenities: ["WiFi", "Bar", "Café"], source: "demo" },
    { id: "h9", name: "Hôtel Jeanne d'Arc Le Marais", rating: 4.4, pricePerNight: 130, currency: "USD", neighborhood: "Le Marais", amenities: ["WiFi", "Breakfast"], source: "demo" },
    { id: "h10", name: "Ibis Paris Tour Eiffel", rating: 3.9, pricePerNight: 95, currency: "USD", neighborhood: "15th Arr.", amenities: ["WiFi", "Restaurant", "Bar"], source: "demo" },
  ],
  "Cancún": [
    { id: "h11", name: "Hostal Natura Cancún", rating: 4.2, pricePerNight: 35, currency: "USD", neighborhood: "Downtown", amenities: ["WiFi", "Pool", "Kitchen"], source: "demo" },
    { id: "h12", name: "Hotel NYX Cancún", rating: 4.5, pricePerNight: 110, currency: "USD", neighborhood: "Hotel Zone", amenities: ["WiFi", "Pool", "Beach", "Spa"], source: "demo" },
    { id: "h13", name: "Krystal Cancún", rating: 4.1, pricePerNight: 85, currency: "USD", neighborhood: "Hotel Zone", amenities: ["WiFi", "Pool", "Restaurant", "Gym"], source: "demo" },
  ],
  "New York": [
    { id: "h14", name: "Pod 51", rating: 4.0, pricePerNight: 100, currency: "USD", neighborhood: "Midtown East", amenities: ["WiFi", "Rooftop", "Café"], source: "demo" },
    { id: "h15", name: "The Jane Hotel", rating: 3.8, pricePerNight: 75, currency: "USD", neighborhood: "West Village", amenities: ["WiFi", "Bar", "Lounge"], source: "demo" },
    { id: "h16", name: "citizenM New York Times Square", rating: 4.4, pricePerNight: 160, currency: "USD", neighborhood: "Times Square", amenities: ["WiFi", "Bar", "Living Room"], source: "demo" },
  ],
};

// ── Weather ──
function generateWeather(city: string, nights: number, month: number): WeatherForecast[] {
  const profiles: Record<string, { baseHigh: number; baseLow: number; condition: string; rain: number }> = {
    Tokyo: { baseHigh: 65, baseLow: 50, condition: "Partly Cloudy", rain: 30 },
    London: { baseHigh: 55, baseLow: 42, condition: "Overcast", rain: 55 },
    Paris: { baseHigh: 60, baseLow: 45, condition: "Partly Cloudy", rain: 40 },
    "Cancún": { baseHigh: 88, baseLow: 74, condition: "Sunny", rain: 15 },
    "New York": { baseHigh: 58, baseLow: 44, condition: "Partly Cloudy", rain: 35 },
  };
  const profile = profiles[city] || { baseHigh: 70, baseLow: 55, condition: "Clear", rain: 20 };

  // seasonal adjustments
  const seasonMod = [0, 0, 5, 10, 15, 20, 25, 25, 20, 10, 5, 0];
  const mod = seasonMod[month] || 0;

  const forecasts: WeatherForecast[] = [];
  for (let i = 0; i < nights + 1; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const variance = Math.floor(Math.random() * 6) - 3;
    const conditions = ["Sunny", "Partly Cloudy", "Overcast", "Light Rain", "Clear"];
    forecasts.push({
      date: date.toISOString().split("T")[0],
      tempHighF: profile.baseHigh + mod + variance,
      tempLowF: profile.baseLow + mod + variance,
      condition: i % 3 === 2 ? "Light Rain" : conditions[i % conditions.length] || profile.condition,
      humidity: 50 + Math.floor(Math.random() * 30),
      rainChance: profile.rain + Math.floor(Math.random() * 20) - 10,
    });
  }
  return forecasts;
}

export function getWeather(city: string, nights: number, month?: number): WeatherForecast[] {
  return generateWeather(city, nights, month ?? new Date().getMonth());
}

// ── Cultural Norms ──
export const DEMO_CULTURAL: Record<string, CulturalNorm[]> = {
  Tokyo: [
    { category: "Etiquette", tip: "Bow when greeting. A slight bow is fine for tourists.", importance: "high" },
    { category: "Dining", tip: "Never tip at restaurants — it can be considered rude.", importance: "high" },
    { category: "Transport", tip: "Keep quiet on trains. Phone calls are frowned upon.", importance: "medium" },
    { category: "Temples", tip: "Remove shoes before entering temple buildings.", importance: "high" },
    { category: "Customs", tip: "Don't eat or drink while walking in public.", importance: "medium" },
    { category: "Cash", tip: "Many smaller shops and restaurants are cash-only.", importance: "high" },
  ],
  London: [
    { category: "Etiquette", tip: "Queue properly. Cutting in line is a serious social faux pas.", importance: "high" },
    { category: "Transport", tip: "Stand on the right side of escalators on the Tube.", importance: "medium" },
    { category: "Dining", tip: "Tipping 10-15% is standard at sit-down restaurants.", importance: "medium" },
    { category: "Customs", tip: "The British love understatement. Avoid being too loud.", importance: "low" },
  ],
  Paris: [
    { category: "Etiquette", tip: "Always greet with 'Bonjour' when entering shops.", importance: "high" },
    { category: "Dining", tip: "Lunch is typically 12-2 PM. Many places close between meals.", importance: "medium" },
    { category: "Dress", tip: "Parisians dress smartly. Avoid athleisure in nicer areas.", importance: "low" },
    { category: "Language", tip: "Try basic French phrases. Locals appreciate the effort.", importance: "medium" },
  ],
  "Cancún": [
    { category: "Safety", tip: "Stick to the Hotel Zone and well-known areas at night.", importance: "high" },
    { category: "Tipping", tip: "Tip 10-20% at restaurants. Tip in pesos when possible.", importance: "medium" },
    { category: "Water", tip: "Drink bottled water only. Avoid ice in street vendor drinks.", importance: "high" },
    { category: "Bargaining", tip: "Haggling is expected at markets but not in fixed-price shops.", importance: "medium" },
  ],
  "New York": [
    { category: "Transport", tip: "Walk fast and stay right on sidewalks. Don't block paths.", importance: "medium" },
    { category: "Tipping", tip: "Tip 18-20% at restaurants; $1-2 per drink at bars.", importance: "high" },
    { category: "Safety", tip: "Keep belongings close in crowds. Use crosswalks.", importance: "medium" },
    { category: "Etiquette", tip: "New Yorkers are direct. Don't take bluntness personally.", importance: "low" },
  ],
};

// ── Activities ──
export const DEMO_ACTIVITIES: Record<string, ActivityOption[]> = {
  Tokyo: [
    { id: "a1", name: "Senso-ji Temple Visit", category: "temples", description: "Tokyo's oldest temple in Asakusa with the iconic Thunder Gate.", estimatedCost: 0, duration: "2h", location: "Asakusa" },
    { id: "a2", name: "Meiji Shrine Walk", category: "temples", description: "Serene Shinto shrine surrounded by forest in Shibuya.", estimatedCost: 0, duration: "1.5h", location: "Harajuku" },
    { id: "a3", name: "Tsukiji Outer Market Food Tour", category: "food tours", description: "Sample fresh sushi, tamagoyaki, and street food at the famous market.", estimatedCost: 45, duration: "3h", location: "Tsukiji" },
    { id: "a4", name: "Akihabara District Exploration", category: "shopping", description: "Electronics, anime, and manga paradise.", estimatedCost: 20, duration: "2h", location: "Akihabara" },
    { id: "a5", name: "Shibuya Crossing & Hachiko", category: "sightseeing", description: "Experience the world's busiest pedestrian crossing.", estimatedCost: 0, duration: "1h", location: "Shibuya" },
    { id: "a6", name: "Ramen Tasting in Shinjuku", category: "food tours", description: "Visit Ramen Street for multiple acclaimed ramen shops.", estimatedCost: 15, duration: "1.5h", location: "Shinjuku" },
    { id: "a7", name: "Fushimi Inari Day Trip", category: "temples", description: "Iconic orange torii gates. Consider if schedule allows day trip.", estimatedCost: 120, duration: "Full day", location: "Kyoto (day trip)" },
    { id: "a8", name: "TeamLab Planets", category: "culture", description: "Immersive digital art museum — walk barefoot through installations.", estimatedCost: 25, duration: "2h", location: "Toyosu" },
    { id: "a9", name: "Izakaya Hopping in Yurakucho", category: "food tours", description: "Explore tiny bars and eateries under the train tracks.", estimatedCost: 30, duration: "2h", location: "Yurakucho" },
    { id: "a10", name: "Shinjuku Gyoen National Garden", category: "sightseeing", description: "Beautiful garden, especially during cherry blossom season.", estimatedCost: 5, duration: "1.5h", location: "Shinjuku" },
  ],
  London: [
    { id: "a11", name: "British Museum", category: "museums", description: "World-class museum with free admission. See the Rosetta Stone.", estimatedCost: 0, duration: "3h", location: "Bloomsbury" },
    { id: "a12", name: "Tower of London", category: "sightseeing", description: "Historic castle, Crown Jewels, and centuries of royal history.", estimatedCost: 35, duration: "3h", location: "Tower Hill" },
    { id: "a13", name: "Borough Market Food Tour", category: "food tours", description: "London's premier food market — artisan cheeses, pastries, global cuisine.", estimatedCost: 30, duration: "2h", location: "Southwark" },
    { id: "a14", name: "Westminster Walking Tour", category: "sightseeing", description: "Big Ben, Parliament, Westminster Abbey, Buckingham Palace.", estimatedCost: 0, duration: "3h", location: "Westminster" },
  ],
  Paris: [
    { id: "a15", name: "Louvre Museum", category: "museums", description: "World's largest art museum. Home to the Mona Lisa.", estimatedCost: 17, duration: "4h", location: "1st Arr." },
    { id: "a16", name: "Eiffel Tower Visit", category: "sightseeing", description: "Iconic iron tower with panoramic views of Paris.", estimatedCost: 26, duration: "2h", location: "7th Arr." },
    { id: "a17", name: "Montmartre Food Walk", category: "food tours", description: "Crêpes, cheese, wine tasting through the artistic hilltop neighborhood.", estimatedCost: 35, duration: "3h", location: "18th Arr." },
    { id: "a18", name: "Seine River Cruise", category: "sightseeing", description: "See Paris landmarks from the water, especially beautiful at sunset.", estimatedCost: 15, duration: "1h", location: "Seine" },
  ],
  "Cancún": [
    { id: "a19", name: "Chichén Itzá Day Trip", category: "sightseeing", description: "UNESCO World Heritage Mayan ruins, one of the New Seven Wonders.", estimatedCost: 65, duration: "Full day", location: "Yucatán" },
    { id: "a20", name: "Snorkeling at Isla Mujeres", category: "beaches", description: "Crystal-clear waters with tropical fish and sea turtles.", estimatedCost: 40, duration: "Half day", location: "Isla Mujeres" },
    { id: "a21", name: "Cenote Swimming", category: "adventure", description: "Swim in natural limestone sinkholes with turquoise water.", estimatedCost: 25, duration: "3h", location: "Riviera Maya" },
    { id: "a22", name: "Tacos & Tequila Tour", category: "food tours", description: "Downtown Cancún authentic Mexican food and mezcal tasting.", estimatedCost: 30, duration: "3h", location: "Downtown" },
  ],
  "New York": [
    { id: "a23", name: "Metropolitan Museum of Art", category: "museums", description: "One of the world's largest and finest art museums.", estimatedCost: 30, duration: "4h", location: "Upper East Side" },
    { id: "a24", name: "Central Park Walk", category: "sightseeing", description: "843 acres of urban paradise — Bethesda Fountain, Bow Bridge, the Lake.", estimatedCost: 0, duration: "2h", location: "Central Park" },
    { id: "a25", name: "Brooklyn Food Tour", category: "food tours", description: "Pizza, bagels, dumplings — taste NYC's best through Brooklyn.", estimatedCost: 45, duration: "3h", location: "Brooklyn" },
    { id: "a26", name: "Statue of Liberty & Ellis Island", category: "sightseeing", description: "Ferry to Lady Liberty and the immigration museum.", estimatedCost: 24, duration: "4h", location: "Liberty Island" },
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
  // prioritize matching activities, then include others
  const matched = all.filter((a) => interests.some((i) => a.category.toLowerCase().includes(i.toLowerCase())));
  const others = all.filter((a) => !matched.includes(a));
  return [...matched, ...others];
}
