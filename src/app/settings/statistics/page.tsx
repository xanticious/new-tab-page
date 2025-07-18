import React from "react";
import { BackToSettingsLink } from "@/components/BackToSettingsLink";

const StatisticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
          <p className="text-gray-600">
            View usage statistics and analytics for your new tab page
          </p>
        </div>

        {/* Statistics Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Usage Analytics
          </h2>
          <p className="text-gray-600">
            Statistics functionality will be implemented here. This could
            include:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Most visited bookmarks</li>
            <li>• Usage patterns and trends</li>
            <li>• Category usage statistics</li>
            <li>• Search history analytics</li>
            <li>• Time spent on different sections</li>
          </ul>
        </div>

        {/* Back to Settings Link */}
        <BackToSettingsLink />
      </div>
    </div>
  );
};

export default StatisticsPage;
