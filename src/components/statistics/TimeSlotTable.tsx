import React from "react";
import {
  TimeSlotData,
  TIME_PERIODS,
  DAYS_OF_WEEK,
} from "@/utils/statisticsUtils";

interface TimeSlotTableProps {
  data: TimeSlotData[][];
}

export const TimeSlotTable: React.FC<TimeSlotTableProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Popular Bookmarks by Time of Day
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-3 bg-gray-50 text-left font-medium text-gray-900">
                Time Period
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 p-3 bg-gray-50 text-center font-medium text-gray-900"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(TIME_PERIODS).map(
              ([periodKey, period], periodIndex) => (
                <tr key={periodKey}>
                  <td className="border border-gray-300 p-3 bg-gray-50 font-medium text-gray-900">
                    {period.label}
                  </td>
                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const slotData = data[periodIndex]?.[dayIndex];
                    const topUrls = slotData?.topUrls || [];

                    return (
                      <td
                        key={dayIndex}
                        className="border border-gray-300 p-3 align-top min-w-[200px]"
                      >
                        {topUrls.length > 0 ? (
                          <div className="space-y-1">
                            {topUrls.map((urlData) => (
                              <div
                                key={urlData.url.id}
                                className="text-xs bg-blue-50 rounded px-2 py-1"
                              >
                                <div className="font-medium text-blue-900 truncate">
                                  {urlData.url.name}
                                </div>
                                <div className="text-blue-600">
                                  {urlData.clicks} click
                                  {urlData.clicks !== 1 ? "s" : ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            N/A
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
