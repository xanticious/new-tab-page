"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import {
  Picture,
  Tag,
  Url,
  Theme,
  Category,
  Profile,
  UrlClickEvent,
  CreatePicture,
  CreateTag,
  CreateUrl,
  CreateTheme,
  CreateCategory,
  CreateProfile,
  UpdatePicture,
  UpdateTag,
  UpdateUrl,
  UpdateTheme,
  UpdateCategory,
  UpdateProfile,
  ThemeData,
  ID,
} from "@/types";

// Database hook for managing state and operations
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await db.init();
        setIsInitialized(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize database"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
  };
}

// Hook for managing pictures
export function usePictures() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPictures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.pictures.getAll();
      setPictures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pictures");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPicture = useCallback(async (data: CreatePicture) => {
    try {
      const newPicture = await db.pictures.create(data);
      setPictures((prev) => [...prev, newPicture]);
      return newPicture;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create picture";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updatePicture = useCallback(async (data: UpdatePicture) => {
    try {
      const updatedPicture = await db.pictures.update(data);
      setPictures((prev) =>
        prev.map((p) => (p.id === data.id ? updatedPicture : p))
      );
      return updatedPicture;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update picture";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deletePicture = useCallback(async (id: ID) => {
    try {
      await db.pictures.delete(id);
      setPictures((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to delete picture";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadPictures();
  }, [loadPictures]);

  return {
    pictures,
    isLoading,
    error,
    createPicture,
    updatePicture,
    deletePicture,
    refresh: loadPictures,
  };
}

// Hook for managing tags
export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.tags.getAll();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tags");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTag = useCallback(async (data: CreateTag) => {
    try {
      const newTag = await db.tags.create(data);
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to create tag";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateTag = useCallback(async (data: UpdateTag) => {
    try {
      const updatedTag = await db.tags.update(data);
      setTags((prev) => prev.map((t) => (t.id === data.id ? updatedTag : t)));
      return updatedTag;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to update tag";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteTag = useCallback(async (id: ID) => {
    try {
      await db.tags.delete(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to delete tag";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    isLoading,
    error,
    createTag,
    updateTag,
    deleteTag,
    refresh: loadTags,
  };
}

// Hook for managing URLs
export function useUrls() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUrls = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.urls.getAll();
      setUrls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load URLs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUrl = useCallback(async (data: CreateUrl) => {
    try {
      const newUrl = await db.urls.create(data);
      setUrls((prev) => [...prev, newUrl]);
      return newUrl;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to create URL";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateUrl = useCallback(async (data: UpdateUrl) => {
    try {
      const updatedUrl = await db.urls.update(data);
      setUrls((prev) => prev.map((u) => (u.id === data.id ? updatedUrl : u)));
      return updatedUrl;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to update URL";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteUrl = useCallback(async (id: ID) => {
    try {
      await db.urls.delete(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to delete URL";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const searchUrls = useCallback(async (query: string) => {
    try {
      const results = await db.urls.search(query);
      return results;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to search URLs";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  return {
    urls,
    isLoading,
    error,
    createUrl,
    updateUrl,
    deleteUrl,
    searchUrls,
    refresh: loadUrls,
  };
}

// Hook for managing themes
export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThemes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.themes.getAll();
      setThemes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load themes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTheme = useCallback(async (data: CreateTheme) => {
    try {
      const newTheme = await db.themes.create(data);
      setThemes((prev) => [...prev, newTheme]);
      return newTheme;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create theme";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateTheme = useCallback(async (data: UpdateTheme) => {
    try {
      const updatedTheme = await db.themes.update(data);
      setThemes((prev) =>
        prev.map((t) => (t.id === data.id ? updatedTheme : t))
      );
      return updatedTheme;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update theme";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteTheme = useCallback(async (id: ID) => {
    try {
      await db.themes.delete(id);
      setThemes((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to delete theme";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadThemes();
  }, [loadThemes]);

  return {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh: loadThemes,
  };
}

// Hook for managing categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategory) => {
    try {
      const newCategory = await db.categories.create(data);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create category";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateCategory = useCallback(async (data: UpdateCategory) => {
    try {
      const updatedCategory = await db.categories.update(data);
      setCategories((prev) =>
        prev.map((c) => (c.id === data.id ? updatedCategory : c))
      );
      return updatedCategory;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update category";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteCategory = useCallback(async (id: ID) => {
    try {
      await db.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to delete category";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}

// Hook for managing profiles
export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.profiles.getAll();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profiles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProfile = useCallback(async (data: CreateProfile) => {
    try {
      const newProfile = await db.profiles.create(data);
      setProfiles((prev) => [...prev, newProfile]);
      return newProfile;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create profile";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfile) => {
    try {
      const updatedProfile = await db.profiles.update(data);
      setProfiles((prev) =>
        prev.map((p) => (p.id === data.id ? updatedProfile : p))
      );
      return updatedProfile;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const deleteProfile = useCallback(async (id: ID) => {
    try {
      await db.profiles.delete(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to delete profile";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    isLoading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    refresh: loadProfiles,
  };
}

// Hook for managing URL click events
export function useUrlClickEvents() {
  const [clickEvents, setClickEvents] = useState<UrlClickEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClickEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.urlClickEvents.getAll();
      setClickEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load click events"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addClickEvent = useCallback(async (urlId: ID) => {
    try {
      const newEvent = await db.urlClickEvents.add(urlId);
      setClickEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to add click event";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const getClickEventsByUrl = useCallback(async (urlId: ID) => {
    try {
      const events = await db.urlClickEvents.getByUrl(urlId);
      return events;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to get click events";
      setError(error);
      throw new Error(error);
    }
  }, []);

  const clearAllClickEvents = useCallback(async () => {
    try {
      await db.urlClickEvents.clear();
      setClickEvents([]);
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to clear click events";
      setError(error);
      throw new Error(error);
    }
  }, []);

  useEffect(() => {
    loadClickEvents();
  }, [loadClickEvents]);

  return {
    clickEvents,
    isLoading,
    error,
    addClickEvent,
    getClickEventsByUrl,
    clearAllClickEvents,
    refresh: loadClickEvents,
  };
}

// Hook for getting theme data by profile
export function useThemeData(profileId: ID | null) {
  const [themeData, setThemeData] = useState<ThemeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThemeData = useCallback(async (id: ID) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.getThemeDataByProfileId(id);
      setThemeData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load theme data"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      loadThemeData(profileId);
    } else {
      setThemeData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [profileId, loadThemeData]);

  return {
    themeData,
    isLoading,
    error,
    refresh: () => profileId && loadThemeData(profileId),
  };
}

// Hook for getting a single profile by ID
export function useProfile(profileId: ID | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (id: ID) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.profiles.get(id);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      loadProfile(profileId);
    } else {
      setProfile(null);
      setError(null);
      setIsLoading(false);
    }
  }, [profileId, loadProfile]);

  return {
    profile,
    isLoading,
    error,
    refresh: () => profileId && loadProfile(profileId),
  };
}
