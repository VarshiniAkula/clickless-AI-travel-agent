import { z } from "zod/v4";

// ── Date Range ──
export const DateRangeSchema = z.object({
  start: z.string(), // ISO date
  end: z.string(),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

// ── Destination ──
export const DestinationSchema = z.object({
  city: z.string(),
  country: z.string().optional(),
  iata: z.string().optional(),
});
export type Destination = z.infer<typeof DestinationSchema>;

// ── Flight Option ──
export const FlightOptionSchema = z.object({
  id: z.string(),
  airline: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  stops: z.number(),
  price: z.number(),
  currency: z.string().default("USD"),
  bookingUrl: z.string().optional(),
  source: z.string().default("demo"),
});
export type FlightOption = z.infer<typeof FlightOptionSchema>;

// ── Hotel Option ──
export const HotelOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number(),
  pricePerNight: z.number(),
  currency: z.string().default("USD"),
  neighborhood: z.string().optional(),
  amenities: z.array(z.string()),
  imageUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  location: z.string().optional(),       // full address
  source: z.string().default("demo"),
});
export type HotelOption = z.infer<typeof HotelOptionSchema>;

// ── Weather Forecast ──
export const WeatherForecastSchema = z.object({
  date: z.string(),
  tempHighF: z.number(),
  tempLowF: z.number(),
  condition: z.string(),
  humidity: z.number().optional(),
  rainChance: z.number().optional(),
  icon: z.string().optional(),
});
export type WeatherForecast = z.infer<typeof WeatherForecastSchema>;

// ── Cultural Norm ──
export const CulturalNormSchema = z.object({
  category: z.string(),
  tip: z.string(),
  importance: z.enum(["high", "medium", "low"]).default("medium"),
});
export type CulturalNorm = z.infer<typeof CulturalNormSchema>;

// ── Activity Option ──
export const ActivityOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  estimatedCost: z.number().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  rating: z.number().optional(),
});
export type ActivityOption = z.infer<typeof ActivityOptionSchema>;

// ── Gear / Packing Requirement ──
export const GearRequirementSchema = z.object({
  item: z.string(),
  reason: z.string(),
  priority: z.enum(["essential", "recommended", "optional"]).default("recommended"),
});
export type GearRequirement = z.infer<typeof GearRequirementSchema>;

// ── Itinerary Day ──
export const ItineraryDaySchema = z.object({
  day: z.number(),
  date: z.string().optional(),
  title: z.string(),
  activities: z.array(
    z.object({
      time: z.string(),
      activity: z.string(),
      location: z.string().optional(),
      cost: z.number().optional(),
      notes: z.string().optional(),
    })
  ),
});
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

// ── Budget Summary ──
export const BudgetSummarySchema = z.object({
  flights: z.number(),
  hotels: z.number(),
  activities: z.number(),
  food: z.number(),
  transport: z.number(),
  misc: z.number(),
  total: z.number(),
  currency: z.string().default("USD"),
});
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

// ── NLU Intent (parsed from user query) ──
export const TravelIntentSchema = z.object({
  origin: z.string().optional(),
  destination: z.string(),
  dates: DateRangeSchema.optional(),
  duration: z.number().optional(), // nights
  budget: z.number().optional(),
  travelers: z.number().default(1),
  activities: z.array(z.string()),
  rawQuery: z.string(),
});
export type TravelIntent = z.infer<typeof TravelIntentSchema>;

// ── Trip Brief (final output) ──
export const TripBriefSchema = z.object({
  id: z.string(),
  intent: TravelIntentSchema,
  flights: z.array(FlightOptionSchema),
  hotels: z.array(HotelOptionSchema),
  weather: z.array(WeatherForecastSchema),
  culturalTips: z.array(CulturalNormSchema),
  activities: z.array(ActivityOptionSchema),
  itinerary: z.array(ItineraryDaySchema),
  packingList: z.array(GearRequirementSchema),
  budget: BudgetSummarySchema,
  summary: z.string(),
  createdAt: z.string(),
});
export type TripBrief = z.infer<typeof TripBriefSchema>;
