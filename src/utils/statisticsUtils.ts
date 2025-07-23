import { UrlClickEvent, Url, ID } from "@/types";

// Time period definitions
export const TIME_PERIODS = {
  MORNING: { start: 6, end: 12, label: "Morning (6am-Noon)" },
  AFTERNOON: { start: 12, end: 18, label: "Afternoon (Noon-6pm)" },
  EVENING: { start: 18, end: 24, label: "Evening (6pm-Midnight)" },
  NIGHT: { start: 0, end: 6, label: "Night (Midnight-6am)" },
} as const;

export type TimePeriod = keyof typeof TIME_PERIODS;

// Days of the week
export const DAYS_OF_WEEK = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

// US Federal Holidays (simplified list for this year)
export const US_FEDERAL_HOLIDAYS_2025 = [
  new Date("2025-01-01"), // New Year's Day
  new Date("2025-01-20"), // Martin Luther King Jr. Day
  new Date("2025-02-17"), // Presidents' Day
  new Date("2025-05-26"), // Memorial Day
  new Date("2025-07-04"), // Independence Day
  new Date("2025-09-01"), // Labor Day
  new Date("2025-10-13"), // Columbus Day
  new Date("2025-11-11"), // Veterans Day
  new Date("2025-11-27"), // Thanksgiving
  new Date("2025-12-25"), // Christmas Day
  // Add more holidays as needed
];

export interface UrlStatistics {
  urlId: ID;
  url: Url;
  totalClicks: number;
  globalClickPercentage: number;
  recentClickPercentage: number;
  weekdayClickPercentage: number;
  timeOfDayPercentage: number;
  predictionScore: number;
}

export interface TimeSlotData {
  timePeriod: TimePeriod;
  dayOfWeek: number;
  topUrls: Array<{
    url: Url;
    clicks: number;
  }>;
}

/**
 * Get the time period for a given hour
 */
export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 24) return "EVENING";
  return "NIGHT";
}

/**
 * Check if a date is a US Federal Holiday
 */
export function isUSFederalHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split("T")[0];
  return US_FEDERAL_HOLIDAYS_2025.some(
    (holiday) => holiday.toISOString().split("T")[0] === dateStr
  );
}

/**
 * Get the most popular bookmarks based on total clicks
 */
export function getMostPopularBookmarks(
  clickEvents: UrlClickEvent[],
  urls: Url[],
  limit: number = 10
): Array<{ url: Url; clicks: number; percentage: number }> {
  const urlClickCounts = new Map<ID, number>();

  // Count clicks for each URL
  clickEvents.forEach((event) => {
    const current = urlClickCounts.get(event.urlId) || 0;
    urlClickCounts.set(event.urlId, current + 1);
  });

  const totalClicks = clickEvents.length;

  // Create results array with URL data
  const results = Array.from(urlClickCounts.entries())
    .map(([urlId, clicks]) => {
      const url = urls.find((u) => u.id === urlId);
      if (!url) return null;

      return {
        url,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0,
      };
    })
    .filter(Boolean) as Array<{ url: Url; clicks: number; percentage: number }>;

  // Sort by clicks descending and take top N
  return results.sort((a, b) => b.clicks - a.clicks).slice(0, limit);
}

/**
 * Get popular bookmarks by time slots (day of week + time period)
 */
export function getPopularBookmarksByTimeSlots(
  clickEvents: UrlClickEvent[],
  urls: Url[]
): TimeSlotData[][] {
  const timeSlots: TimeSlotData[][] = [];

  // Initialize the matrix: 4 time periods x 7 days
  for (let period = 0; period < 4; period++) {
    timeSlots[period] = [];
    for (let day = 0; day < 7; day++) {
      timeSlots[period][day] = {
        timePeriod: Object.keys(TIME_PERIODS)[period] as TimePeriod,
        dayOfWeek: day,
        topUrls: [],
      };
    }
  }

  // Group clicks by time slot
  const slotClickCounts = new Map<string, Map<ID, number>>();

  clickEvents.forEach((event) => {
    const date = new Date(event.timestamp);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const timePeriod = getTimePeriod(hour);

    const slotKey = `${timePeriod}-${dayOfWeek}`;

    if (!slotClickCounts.has(slotKey)) {
      slotClickCounts.set(slotKey, new Map());
    }

    const urlCounts = slotClickCounts.get(slotKey)!;
    const current = urlCounts.get(event.urlId) || 0;
    urlCounts.set(event.urlId, current + 1);
  });

  // Fill the matrix with top 3 URLs for each slot
  Object.keys(TIME_PERIODS).forEach((periodName, periodIndex) => {
    for (let day = 0; day < 7; day++) {
      const slotKey = `${periodName}-${day}`;
      const urlCounts = slotClickCounts.get(slotKey) || new Map();

      const topUrls = Array.from(urlCounts.entries())
        .map(([urlId, clicks]) => {
          const url = urls.find((u) => u.id === urlId);
          return url ? { url, clicks } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b!.clicks - a!.clicks)
        .slice(0, 3) as Array<{ url: Url; clicks: number }>;

      timeSlots[periodIndex][day].topUrls = topUrls;
    }
  });

  return timeSlots;
}

/**
 * Calculate prediction scores for URLs based on various factors
 */
export function calculatePredictionScores(
  clickEvents: UrlClickEvent[],
  urls: Url[],
  targetDate: Date
): UrlStatistics[] {
  const isHoliday = isUSFederalHoliday(targetDate);
  const targetDayOfWeek = targetDate.getDay();
  const targetHour = targetDate.getHours();
  const targetTimePeriod = getTimePeriod(targetHour);

  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Total clicks for global percentage calculation
  const totalClicks = clickEvents.length;

  // Recent clicks (last 48 hours)
  const recentClicks = clickEvents.filter(
    (event) => new Date(event.timestamp) > twoDaysAgo
  );
  const totalRecentClicks = recentClicks.length;

  return urls
    .map((url) => {
      const urlClicks = clickEvents.filter((event) => event.urlId === url.id);
      const totalUrlClicks = urlClicks.length;

      // Global click percentage
      const globalClickPercentage =
        totalClicks > 0 ? totalUrlClicks / totalClicks : 0;

      // Recent click percentage (last 48 hours)
      const recentUrlClicks = recentClicks.filter(
        (event) => event.urlId === url.id
      ).length;
      const recentClickPercentage =
        totalRecentClicks > 0 ? recentUrlClicks / totalRecentClicks : 0;

      let weekdayClickPercentage = 0;
      let timeOfDayPercentage = 0;

      if (!isHoliday) {
        // Find the last 4 occurrences of the target weekday (excluding holidays)
        const weekdayDates: Date[] = [];
        const checkDate = new Date(targetDate);
        checkDate.setDate(checkDate.getDate() - 7); // Start from a week before

        while (
          weekdayDates.length < 4 &&
          checkDate > new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        ) {
          if (
            checkDate.getDay() === targetDayOfWeek &&
            !isUSFederalHoliday(checkDate)
          ) {
            weekdayDates.push(new Date(checkDate));
          }
          checkDate.setDate(checkDate.getDate() - 7);
        }

        // Calculate weekday percentage
        if (weekdayDates.length > 0) {
          const weekdayClicks = clickEvents.filter((event) => {
            const eventDate = new Date(event.timestamp);
            return weekdayDates.some(
              (date) => eventDate.toDateString() === date.toDateString()
            );
          });

          const weekdayUrlClicks = weekdayClicks.filter(
            (event) => event.urlId === url.id
          );
          weekdayClickPercentage =
            weekdayClicks.length > 0
              ? weekdayUrlClicks.length / weekdayClicks.length
              : 0;
        }

        // Calculate time of day percentage for the same weekdays
        if (weekdayDates.length > 0) {
          const timeSlotClicks = clickEvents.filter((event) => {
            const eventDate = new Date(event.timestamp);
            const eventHour = eventDate.getHours();
            const eventTimePeriod = getTimePeriod(eventHour);

            return (
              weekdayDates.some(
                (date) => eventDate.toDateString() === date.toDateString()
              ) && eventTimePeriod === targetTimePeriod
            );
          });

          const timeSlotUrlClicks = timeSlotClicks.filter(
            (event) => event.urlId === url.id
          );
          timeOfDayPercentage =
            timeSlotClicks.length > 0
              ? timeSlotUrlClicks.length / timeSlotClicks.length
              : 0;
        }
      }

      // Calculate prediction score (weighted sum)
      const predictionScore =
        globalClickPercentage * 0.3 +
        recentClickPercentage * 0.3 +
        weekdayClickPercentage * 0.2 +
        timeOfDayPercentage * 0.2;

      return {
        urlId: url.id,
        url,
        totalClicks: totalUrlClicks,
        globalClickPercentage,
        recentClickPercentage,
        weekdayClickPercentage,
        timeOfDayPercentage,
        predictionScore,
      };
    })
    .sort((a, b) => b.predictionScore - a.predictionScore);
}
