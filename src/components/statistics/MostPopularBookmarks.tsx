import React from "react";
import { Url } from "@/types";

interface MostPopularBookmarksProps {
  data: Array<{
    url: Url;
    clicks: number;
    percentage: number;
  }>;
}

export const MostPopularBookmarks: React.FC<MostPopularBookmarksProps> = ({
  data,
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          10 Most Popular Bookmarks
        </h3>
        <p className="text-gray-500">No click data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        10 Most Popular Bookmarks
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.url.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {index + 1}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{item.url.name}</h4>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {item.url.url}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {item.clicks}
              </div>
              <div className="text-sm text-gray-500">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
