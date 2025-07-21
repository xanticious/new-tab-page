"use client";

import React from "react";
import { BackToSettingsLink } from "@/components/BackToSettingsLink";
import { MostPopularBookmarks } from "@/components/statistics/MostPopularBookmarks";
import { TimeSlotTable } from "@/components/statistics/TimeSlotTable";
import { PredictionWidget } from "@/components/statistics/PredictionWidget";
import { useStatistics } from "@/hooks/useStatistics";

const StatisticsPage = () => {
  const {
    isLoading,
    error,
    getMostPopular,
    getTimeSlotData,
    generatePredictions,
    predictions,
    isPredicting,
    hasData,
  } = useStatistics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Statistics
            </h1>
            <p className="text-gray-600">
              View usage statistics and analytics for your new tab page
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Statistics
            </h1>
            <p className="text-gray-600">
              View usage statistics and analytics for your new tab page
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Error Loading Statistics
            </h2>
            <p className="text-red-700">{error}</p>
          </div>
          <div className="mt-6">
            <BackToSettingsLink />
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Statistics
            </h1>
            <p className="text-gray-600">
              View usage statistics and analytics for your new tab page
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              No Data Available
            </h2>
            <p className="text-blue-700">
              Start clicking on bookmarks to see your usage statistics here.
              Your click data is stored locally in your browser.
            </p>
          </div>
          <div className="mt-6">
            <BackToSettingsLink />
          </div>
        </div>
      </div>
    );
  }

  const mostPopular = getMostPopular(10);
  const timeSlotData = getTimeSlotData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
          <p className="text-gray-600">
            View usage statistics and analytics for your new tab page
          </p>
        </div>

        {/* Statistics Content */}
        <div className="space-y-8">
          {/* Most Popular Bookmarks */}
          <MostPopularBookmarks data={mostPopular} />

          {/* Time Slot Table */}
          <TimeSlotTable data={timeSlotData} />

          {/* Prediction Widget */}
          <PredictionWidget
            onPredict={generatePredictions}
            predictions={predictions}
            isLoading={isPredicting}
          />
        </div>

        {/* Back to Settings Link */}
        <div className="mt-8">
          <BackToSettingsLink />
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
