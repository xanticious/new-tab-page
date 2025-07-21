import { useState, useCallback } from "react";
import { useUrlClickEvents, useUrls } from "@/hooks/useDatabase";
import {
  getMostPopularBookmarks,
  getPopularBookmarksByTimeSlots,
  calculatePredictionScores,
  UrlStatistics,
  TimeSlotData,
} from "@/utils/statisticsUtils";

export function useStatistics() {
  const {
    clickEvents,
    isLoading: clickEventsLoading,
    error: clickEventsError,
  } = useUrlClickEvents();
  const { urls, isLoading: urlsLoading, error: urlsError } = useUrls();

  const [predictions, setPredictions] = useState<UrlStatistics[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);

  const isLoading = clickEventsLoading || urlsLoading;
  const error = clickEventsError || urlsError;

  // Get most popular bookmarks
  const getMostPopular = useCallback(
    (limit: number = 10) => {
      if (!clickEvents || !urls) return [];
      return getMostPopularBookmarks(clickEvents, urls, limit);
    },
    [clickEvents, urls]
  );

  // Get time slot data
  const getTimeSlotData = useCallback((): TimeSlotData[][] => {
    if (!clickEvents || !urls) return [];
    return getPopularBookmarksByTimeSlots(clickEvents, urls);
  }, [clickEvents, urls]);

  // Generate predictions for a specific date/time
  const generatePredictions = useCallback(
    async (targetDate: Date) => {
      if (!clickEvents || !urls) return;

      setIsPredicting(true);
      try {
        // Add a small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 500));

        const predictionResults = calculatePredictionScores(
          clickEvents,
          urls,
          targetDate
        );
        setPredictions(predictionResults);
      } catch (err) {
        console.error("Failed to generate predictions:", err);
      } finally {
        setIsPredicting(false);
      }
    },
    [clickEvents, urls]
  );

  return {
    isLoading,
    error,
    getMostPopular,
    getTimeSlotData,
    generatePredictions,
    predictions,
    isPredicting,
    hasData: clickEvents && clickEvents.length > 0,
  };
}
