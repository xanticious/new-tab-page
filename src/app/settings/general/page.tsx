"use client";

import React, { useState, useEffect } from "react";
import { useProfiles } from "@/hooks/useDatabase";
import { useSelectedProfileSettings } from "@/hooks/useSelectedProfile";
import { BackToSettingsLink } from "@/components/BackToSettingsLink";
import { Profile } from "@/types";

const GeneralSettingsPage = () => {
  const { profiles, isLoading, error } = useProfiles();
  const {
    localProfileId,
    updateLocalProfile,
    saveProfile,
    resetToSaved,
    hasUnsavedChanges,
    isLoaded,
  } = useSelectedProfileSettings();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Set default profile if none selected and profiles are loaded
  useEffect(() => {
    if (isLoaded && profiles.length > 0 && !localProfileId) {
      const defaultProfile =
        profiles.find((p) => p.id === "profile_default") || profiles[0];
      updateLocalProfile(defaultProfile.id);
    }
  }, [isLoaded, profiles, localProfileId, updateLocalProfile]);

  const handleSave = () => {
    saveProfile();
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    resetToSaved();
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">General Settings</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">General Settings</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Error Loading Profiles</h2>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
        <BackToSettingsLink />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">General Settings</h1>

      {showSaveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            Settings saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="profile-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Selected Profile
          </label>
          <select
            id="profile-select"
            value={localProfileId}
            onChange={(e) => updateLocalProfile(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {profiles.length === 0 ? (
              <option value="">No profiles available</option>
            ) : (
              profiles.map((profile: Profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))
            )}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Choose which profile to use for displaying bookmarks on the main
            page.
          </p>
        </div>

        {/* Save/Reset buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              hasUnsavedChanges
                ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
          <button
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              hasUnsavedChanges
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                : "border border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Reset
          </button>
        </div>

        {hasUnsavedChanges && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <strong>Note:</strong> You have unsaved changes. Click &quot;Save
            Changes&quot; to apply them.
          </p>
        )}
      </div>

      <BackToSettingsLink />
    </div>
  );
};

export default GeneralSettingsPage;
