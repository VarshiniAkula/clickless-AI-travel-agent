import {
  FlightOptionSchema,
  HotelOptionSchema,
  WeatherForecastSchema,
  CulturalNormSchema,
  ActivityOptionSchema,
  type FlightOption,
  type HotelOption,
  type WeatherForecast,
  type CulturalNorm,
  type ActivityOption,
} from "@/lib/types";

export function normalizeFlights(raw: unknown[]): FlightOption[] {
  return raw
    .map((item) => {
      const result = FlightOptionSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((f): f is FlightOption => f !== null);
}

export function normalizeHotels(raw: unknown[]): HotelOption[] {
  return raw
    .map((item) => {
      const result = HotelOptionSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((h): h is HotelOption => h !== null);
}

export function normalizeWeather(raw: unknown[]): WeatherForecast[] {
  return raw
    .map((item) => {
      const result = WeatherForecastSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((w): w is WeatherForecast => w !== null);
}

export function normalizeCulturalTips(raw: unknown[]): CulturalNorm[] {
  return raw
    .map((item) => {
      const result = CulturalNormSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((c): c is CulturalNorm => c !== null);
}

export function normalizeActivities(raw: unknown[]): ActivityOption[] {
  return raw
    .map((item) => {
      const result = ActivityOptionSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter((a): a is ActivityOption => a !== null);
}

export type NormalizedPayload = {
  flights: FlightOption[];
  hotels: HotelOption[];
  weather: WeatherForecast[];
  cultural: CulturalNorm[];
  activities: ActivityOption[];
};

export function normalizePayload(raw: Record<string, unknown[]>): NormalizedPayload {
  return {
    flights: normalizeFlights(raw.flights || []),
    hotels: normalizeHotels(raw.hotels || []),
    weather: normalizeWeather(raw.weather || []),
    cultural: normalizeCulturalTips(raw.cultural || []),
    activities: normalizeActivities(raw.activities || []),
  };
}
