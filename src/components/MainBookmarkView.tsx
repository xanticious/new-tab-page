"use client";

import React from "react";
import { useThemeData, useProfile } from "@/hooks/useDatabase";
import { useThemeComponents } from "@/hooks/useThemeComponents";
import { useSelectedProfile } from "@/hooks/useSelectedProfile";

export function MainBookmarkView() {
  const { selectedProfileId, isLoaded } = useSelectedProfile();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile(selectedProfileId);
  const {
    themeData,
    isLoading: themeDataLoading,
    error: themeDataError,
  } = useThemeData(selectedProfileId);
  const { getThemeComponentById, isLoading: themesLoading } =
    useThemeComponents();

  // Don't render anything until we've loaded the selected profile from localStorage
  if (!isLoaded || profileLoading || themeDataLoading || themesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error Loading Profile</h2>
          <p className="text-red-600 mt-1">{profileError}</p>
        </div>
      </div>
    );
  }

  if (themeDataError) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error Loading Bookmarks</h2>
          <p className="text-red-600 mt-1">{themeDataError}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-medium">Profile Not Found</h2>
          <p className="text-yellow-600 mt-1">
            Unable to load the selected profile.
          </p>
        </div>
      </div>
    );
  }

  if (!themeData) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-medium">No Data Available</h2>
          <p className="text-yellow-600 mt-1">
            Unable to load bookmark data for the selected profile.
          </p>
        </div>
      </div>
    );
  }

  // Get the theme component using the theme ID from the selected profile
  const ThemeComponent = getThemeComponentById(profile.theme);

  if (!ThemeComponent) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Theme Not Found</h2>
          <p className="text-red-600 mt-1">
            Unable to load the default theme component.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ThemeComponent data={themeData} />
    </div>
  );
}
