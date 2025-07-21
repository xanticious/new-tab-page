"use client";

import React, { useState } from "react";
import { useThemeComponents } from "@/hooks/useThemeComponents";
import { ThemeData } from "@/types";

// Sample data for theme preview
const sampleThemeData: ThemeData = {
  categories: [
    {
      displayName: "Development",
      urls: [
        {
          id: "1",
          name: "GitHub",
          url: "https://github.com",
          picture: {
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          },
        },
        {
          id: "2",
          name: "Stack Overflow",
          url: "https://stackoverflow.com",
          picture: {
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          },
        },
        {
          id: "3",
          name: "VS Code",
          url: "https://code.visualstudio.com",
          picture: {
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          },
        },
      ],
    },
    {
      displayName: "Social",
      urls: [
        {
          id: "4",
          name: "Twitter",
          url: "https://twitter.com",
          picture: {
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          },
        },
        {
          id: "5",
          name: "LinkedIn",
          url: "https://linkedin.com",
          picture: {
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          },
        },
      ],
    },
  ],
};

export function ThemePreview() {
  const { themes, isLoading, error, getThemeComponentWithProps } =
    useThemeComponents();
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  React.useEffect(() => {
    if (themes.length > 0 && !selectedThemeId) {
      setSelectedThemeId(themes[0].id);
    }
  }, [themes, selectedThemeId]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading themes: {error}</p>
        </div>
      </div>
    );
  }

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);
  const ThemeComponent = selectedTheme
    ? getThemeComponentWithProps(selectedTheme.id)
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Theme Preview
        </h2>

        {/* Theme Selector */}
        <div className="mb-6">
          <label
            htmlFor="theme-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Theme:
          </label>
          <select
            id="theme-select"
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name} {theme.readonly ? "(Preloaded)" : "(Custom)"}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Info */}
        {selectedTheme && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{selectedTheme.name}</h3>
            <p className="text-sm text-gray-600">ID: {selectedTheme.id}</p>
            {selectedTheme.readonly && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full mt-1">
                Read-only
              </span>
            )}
          </div>
        )}
      </div>

      {/* Theme Preview */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
        </div>
        <div className="relative">
          {ThemeComponent ? (
            <div className="border-2 border-dashed border-gray-200">
              <ThemeComponent data={sampleThemeData} />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No theme selected or theme component could not be loaded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
