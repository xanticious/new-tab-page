"use client";

import { useDatabase } from "@/hooks/useDatabase";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading, error } = useDatabase();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon
              className="h-12 w-12 mx-auto"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Database Error
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Database not ready</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
