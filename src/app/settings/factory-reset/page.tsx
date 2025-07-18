"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { ChartBarIcon } from "@heroicons/react/24/solid";

const FactoryResetPage = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isResettingStats, setIsResettingStats] = useState(false);
  const [showStatsConfirmDialog, setShowStatsConfirmDialog] = useState(false);
  const [statsResetComplete, setStatsResetComplete] = useState(false);

  const handleFactoryReset = async () => {
    setIsResetting(true);
    try {
      await db.factoryReset();
      setResetComplete(true);
      setShowConfirmDialog(false);

      // Optionally redirect to home after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Factory reset failed:", error);
      alert(
        `Factory reset failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetStatistics = async () => {
    setIsResettingStats(true);
    try {
      await db.urlClickEvents.clear();
      setStatsResetComplete(true);
      setShowStatsConfirmDialog(false);

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setStatsResetComplete(false);
      }, 3000);
    } catch (error) {
      console.error("Statistics reset failed:", error);
      alert(
        `Statistics reset failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsResettingStats(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Factory Reset
          </h1>
          <p className="text-gray-600">
            Reset all settings and data to their default values
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">
              <ExclamationTriangleIcon
                className="w-7 h-7 text-red-500"
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Warning
              </h3>
              <p className="text-red-700">
                This action will permanently delete all your data including
                bookmarks, settings, profiles, categories, tags, and custom
                themes. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Reset Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reset Options
          </h2>

          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Reset Statistics Only
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Reset only URL click statistics and usage data. Your bookmarks,
                settings, and other data will be preserved.
              </p>
              <button
                onClick={() => setShowStatsConfirmDialog(true)}
                disabled={isResettingStats}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResettingStats ? "Resetting..." : "Reset Statistics"}
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Complete Factory Reset
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Reset everything to default state. All data will be lost.
              </p>
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isResetting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? "Resetting..." : "Reset Everything"}
              </button>
            </div>
          </div>
        </div>

        {/* Backup Recommendation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">
              {/* No direct Heroicon for '💡', so keep emoji or use an icon if desired */}
              <span role="img" aria-label="info">
                💡
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Recommendation
              </h3>
              <p className="text-blue-700">
                Before performing a factory reset, consider exporting your data
                using the
                <Link
                  href="/settings/import-export"
                  className="underline font-medium ml-1"
                >
                  Import / Export
                </Link>{" "}
                feature.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Settings Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/settings"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="mr-2 w-4 h-4" aria-hidden="true" />
            Back to Settings
          </Link>
        </div>

        {/* Statistics Reset Confirmation Dialog */}
        {showStatsConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ChartBarIcon
                    className="w-16 h-16 text-orange-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reset Statistics
                </h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete all URL click statistics and
                  usage data. Your bookmarks, settings, profiles, categories,
                  tags, and themes will be preserved.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowStatsConfirmDialog(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    disabled={isResettingStats}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetStatistics}
                    disabled={isResettingStats}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isResettingStats
                      ? "Resetting..."
                      : "Yes, Reset Statistics"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <ExclamationTriangleIcon
                    className="w-16 h-16 text-red-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Factory Reset
                </h3>
                <p className="text-gray-600 mb-6">
                  This will permanently delete all your data including
                  bookmarks, settings, profiles, categories, tags, custom
                  themes, and usage statistics. This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFactoryReset}
                    disabled={isResetting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isResetting ? "Resetting..." : "Yes, Reset Everything"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Reset Success Message */}
        {statsResetComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircleIcon
                    className="w-16 h-16 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Statistics Reset Complete
                </h3>
                <p className="text-gray-600 mb-4">
                  All URL click statistics have been successfully deleted. Your
                  other data remains intact.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {resetComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircleIcon
                    className="w-16 h-16 text-green-500"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Factory Reset Complete
                </h3>
                <p className="text-gray-600 mb-4">
                  All data has been successfully deleted. You will be redirected
                  to the home page shortly.
                </p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryResetPage;
