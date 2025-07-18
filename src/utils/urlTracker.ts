import { db } from "@/lib/db";
import { ID, Url } from "@/types";

/**
 * Utility to track URL clicks and handle URL navigation
 */
export class UrlTracker {
  /**
   * Track a URL click and optionally navigate to the URL
   * @param urlId - The ID of the URL being clicked
   * @param navigate - Whether to open the URL in a new tab (default: true)
   */
  static async trackClick(urlId: ID, navigate: boolean = true): Promise<void> {
    try {
      // Add click event to database
      await db.urlClickEvents.add(urlId);

      if (navigate) {
        // Get the URL details and open in new tab
        const url = await db.urls.get(urlId);
        if (url) {
          window.open(url.url, "_blank", "noopener,noreferrer");
        }
      }
    } catch (error) {
      console.error("Failed to track URL click:", error);
      // Don't prevent navigation even if tracking fails
      if (navigate) {
        const url = await db.urls.get(urlId);
        if (url) {
          window.open(url.url, "_blank", "noopener,noreferrer");
        }
      }
    }
  }

  /**
   * Get click statistics for a specific URL
   * @param urlId - The ID of the URL
   * @returns Click statistics including total clicks and recent activity
   */
  static async getUrlStats(urlId: ID): Promise<{
    totalClicks: number;
    todayClicks: number;
    thisWeekClicks: number;
    lastClickedAt: Date | null;
  }> {
    try {
      const clickEvents = await db.urlClickEvents.getByUrl(urlId);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayClicks = clickEvents.filter(
        (event) => new Date(event.timestamp) >= today
      ).length;

      const thisWeekClicks = clickEvents.filter(
        (event) => new Date(event.timestamp) >= oneWeekAgo
      ).length;

      const lastClickedAt =
        clickEvents.length > 0
          ? new Date(
              Math.max(
                ...clickEvents.map((e) => new Date(e.timestamp).getTime())
              )
            )
          : null;

      return {
        totalClicks: clickEvents.length,
        todayClicks,
        thisWeekClicks,
        lastClickedAt,
      };
    } catch (error) {
      console.error("Failed to get URL stats:", error);
      return {
        totalClicks: 0,
        todayClicks: 0,
        thisWeekClicks: 0,
        lastClickedAt: null,
      };
    }
  }

  /**
   * Get most popular URLs based on click count
   * @param limit - Maximum number of URLs to return (default: 10)
   * @returns Array of URLs with their click counts
   */
  static async getMostPopularUrls(limit: number = 10): Promise<
    Array<{
      url: Url;
      clickCount: number;
    }>
  > {
    try {
      const [urls, clickEvents] = await Promise.all([
        db.urls.getAll(),
        db.urlClickEvents.getAll(),
      ]);

      const clickCounts = new Map<ID, number>();

      // Count clicks for each URL
      clickEvents.forEach((event) => {
        clickCounts.set(event.urlId, (clickCounts.get(event.urlId) || 0) + 1);
      });

      // Create result array with URL details and click counts
      const urlsWithCounts = urls.map((url) => ({
        url,
        clickCount: clickCounts.get(url.id) || 0,
      }));

      // Sort by click count and return top results
      return urlsWithCounts
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get popular URLs:", error);
      return [];
    }
  }

  /**
   * Get hourly usage patterns
   * @returns Array of hours with click counts
   */
  static async getHourlyUsagePattern(): Promise<
    Array<{
      hour: number;
      clickCount: number;
    }>
  > {
    try {
      const clickEvents = await db.urlClickEvents.getAll();

      const hourlyClicks = new Array(24).fill(0).map((_, hour) => ({
        hour,
        clickCount: 0,
      }));

      clickEvents.forEach((event) => {
        hourlyClicks[event.hour].clickCount++;
      });

      return hourlyClicks;
    } catch (error) {
      console.error("Failed to get hourly usage pattern:", error);
      return new Array(24).fill(0).map((_, hour) => ({ hour, clickCount: 0 }));
    }
  }
}

export default UrlTracker;
