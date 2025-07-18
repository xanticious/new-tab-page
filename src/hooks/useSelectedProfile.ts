"use client";

import { useState, useEffect } from "react";

const SELECTED_PROFILE_STORAGE_KEY = "selectedProfileId";
const DEFAULT_PROFILE_ID = "profile_default";

export function useSelectedProfile() {
  const [selectedProfileId, setSelectedProfileId] =
    useState<string>(DEFAULT_PROFILE_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(SELECTED_PROFILE_STORAGE_KEY);
    if (stored) {
      setSelectedProfileId(stored);
    }
    setIsLoaded(true);
  }, []);

  const updateSelectedProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, profileId);
  };

  return {
    selectedProfileId,
    updateSelectedProfile,
    isLoaded,
  };
}

// Hook for settings pages that need local state separate from saved state
export function useSelectedProfileSettings() {
  const [savedProfileId, setSavedProfileId] =
    useState<string>(DEFAULT_PROFILE_ID);
  const [localProfileId, setLocalProfileId] =
    useState<string>(DEFAULT_PROFILE_ID);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(SELECTED_PROFILE_STORAGE_KEY);
    const profileId = stored || DEFAULT_PROFILE_ID;
    setSavedProfileId(profileId);
    setLocalProfileId(profileId);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Check if there are unsaved changes
    setHasUnsavedChanges(localProfileId !== savedProfileId);
  }, [localProfileId, savedProfileId]);

  const updateLocalProfile = (profileId: string) => {
    setLocalProfileId(profileId);
  };

  const saveProfile = () => {
    localStorage.setItem(SELECTED_PROFILE_STORAGE_KEY, localProfileId);
    setSavedProfileId(localProfileId);
    setHasUnsavedChanges(false);
  };

  const resetToSaved = () => {
    setLocalProfileId(savedProfileId);
    setHasUnsavedChanges(false);
  };

  return {
    selectedProfileId: savedProfileId, // The actual saved profile for MainBookmarkView
    localProfileId, // The local state for the settings UI
    updateLocalProfile,
    saveProfile,
    resetToSaved,
    hasUnsavedChanges,
    isLoaded,
  };
}
