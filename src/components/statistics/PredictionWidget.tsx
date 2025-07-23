import React, { useState } from "react";
import { UrlStatistics } from "@/utils/statisticsUtils";

interface PredictionWidgetProps {
  onPredict: (date: Date) => void;
  predictions: UrlStatistics[];
  isLoading: boolean;
}

export const PredictionWidget: React.FC<PredictionWidgetProps> = ({
  onPredict,
  predictions,
  isLoading,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("12:00");

  const handlePredict = () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes, 0, 0);

    onPredict(date);
  };

  const formatDateTime = () => {
    if (!selectedDate || !selectedTime) return "";

    const date = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Interactive Prediction
      </h3>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Choose a future date and time to predict which bookmarks you&apos;re
          most likely to click.
        </p>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label
              htmlFor="prediction-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="prediction-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="prediction-time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time
            </label>
            <input
              id="prediction-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={!selectedDate || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Predicting..." : "Predict"}
          </button>
        </div>

        {selectedDate && selectedTime && (
          <div className="mt-2 text-sm text-gray-600">
            Predicting for:{" "}
            <span className="font-medium">{formatDateTime()}</span>
          </div>
        )}
      </div>

      {predictions.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Top 10 Predicted Bookmarks
          </h4>
          <div className="space-y-2">
            {predictions.slice(0, 10).map((prediction, index) => (
              <div
                key={prediction.url.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {prediction.url.name}
                    </h5>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {prediction.url.url}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {(prediction.predictionScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {prediction.totalClicks} total clicks
                  </div>
                </div>
              </div>
            ))}
          </div>

          {predictions.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">
                Prediction Factors:
              </h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  • Global Click %: How often you click this link overall
                </div>
                <div>
                  • Recent Click %: How much you&apos;ve clicked this in the
                  last 48 hours
                </div>
                <div>• Weekday %: Your pattern for this day of the week</div>
                <div>• Time of Day %: Your pattern for this time period</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
