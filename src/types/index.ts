import React from "react";

// Base types
export type ID = string;

// Picture model - stores image data for URL icons/thumbnails
export interface Picture {
  id: ID;
  name: string;
  base64ImageData: string;
  altText: string;
  readonly: boolean;
}

// Tag model - for categorizing and filtering URLs
export interface Tag {
  id: ID;
  name: string;
  synonyms: string[];
  readonly: boolean;
}

// URL model - represents a bookmarked link
export interface Url {
  id: ID;
  name: string;
  url: string;
  tags: ID[]; // Array of tag IDs
  picture?: ID; // Optional picture ID
  readonly: boolean;
}

// Theme data structure passed to theme components
export interface ThemeData {
  categories: Array<{
    displayName: string;
    urls: Array<{
      id: ID;
      name: string;
      url: string;
      picture?: {
        base64ImageData: string;
      };
    }>;
  }>;
}

// TrackableLink component props interface
export interface TrackableLinkProps {
  urlId: ID;
  url: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Theme component type
export type ThemeComponent = React.ComponentType<{
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, unknown>;
}>;

// Theme model - for customizing the appearance
export interface Theme {
  id: ID;
  name: string;
  component: ThemeComponent; // React component that renders the theme
  sourceCode: string; // The source code for the component
  globals: Record<string, unknown>; // Global object for the theme to use for caching, etc.
  readonly: boolean;
} // Category model - groups related URLs together
export interface Category {
  id: ID;
  name: string;
  urls: ID[]; // Array of URL IDs
  readonly: boolean;
}

// Profile model - represents different user contexts (work, personal, etc.)
export interface Profile {
  id: ID;
  name: string;
  categories: ID[]; // Array of category IDs
  includeRecentCategory: boolean;
  numRecentToShow: number;
  theme: ID; // Theme ID
  readonly: boolean;
}

// Search engine options
export type SearchEngine = "google" | "bing" | "duckduckgo" | "yahoo";

// App state model - represents the current application state
export interface AppState {
  selectedProfile: ID; // Currently active profile ID
  filterTerm: string; // Current search/filter term
  selectedSearchEngine: SearchEngine;
  searchEngineSearchTerm: string;
}

// Additional utility types

// For creating new items (without ID and readonly - users cannot create readonly resources)
export type CreatePicture = Omit<Picture, "id" | "readonly">;
export type CreateTag = Omit<Tag, "id" | "readonly">;
export type CreateUrl = Omit<Url, "id" | "readonly">;
export type CreateTheme = Omit<Theme, "id" | "readonly">;
export type CreateCategory = Omit<Category, "id" | "readonly">;
export type CreateProfile = Omit<Profile, "id" | "readonly">;

// For updating existing items (all fields optional except ID, readonly cannot be modified)
export type UpdatePicture = Partial<Omit<Picture, "readonly">> & { id: ID };
export type UpdateTag = Partial<Omit<Tag, "readonly">> & { id: ID };
export type UpdateUrl = Partial<Omit<Url, "readonly">> & { id: ID };
export type UpdateTheme = Partial<Omit<Theme, "readonly">> & { id: ID };
export type UpdateCategory = Partial<Omit<Category, "readonly">> & { id: ID };
export type UpdateProfile = Partial<Omit<Profile, "readonly">> & { id: ID };
export type UpdateAppState = Partial<AppState>;

// Collection types for storing multiple items
export interface Collections {
  pictures: Record<ID, Picture>;
  tags: Record<ID, Tag>;
  urls: Record<ID, Url>;
  themes: Record<ID, Theme>;
  categories: Record<ID, Category>;
  profiles: Record<ID, Profile>;
  urlStatistics: Record<ID, UrlStatistics>;
  clickEvents: UrlClickEvent[]; // Array for chronological tracking
}

// Complete application data structure
export interface AppData {
  collections: Collections;
  appState: AppState;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// Recent URLs tracking
export interface RecentUrl {
  urlId: ID;
  accessedAt: Date;
  accessCount: number;
}

// Search and filter types
export interface SearchFilters {
  tags?: ID[];
  categories?: ID[];
  searchTerm?: string;
}

export interface SearchResult {
  urls: Url[];
  totalCount: number;
  hasMore: boolean;
}

// Export configuration for sharing profiles/settings
export interface ExportData {
  version: string;
  exportedAt: Date;
  profiles: Profile[];
  categories: Category[];
  urls: Url[];
  tags: Tag[];
  pictures: Picture[];
  themes: Theme[];
}

// Import configuration
export interface ImportResult {
  success: boolean;
  importedCount: {
    profiles: number;
    categories: number;
    urls: number;
    tags: number;
    pictures: number;
    themes: number;
  };
  errors: string[];
}

// Statistics types for tracking user behavior
export interface UrlClickEvent {
  id?: number; // Auto-incremented ID from IndexedDB
  urlId: ID;
  timestamp: Date;
  hour: number; // 0-23, extracted from timestamp for easy querying
  weekday: number; // 0-6, where 0 = Sunday, extracted from timestamp
}

export interface UrlStatistics {
  urlId: ID;
  totalClicks: number;
  clicksByHour: Record<number, number>; // Hour (0-23) -> click count
  firstClickedAt: Date;
  lastClickedAt: Date;
  averageClicksPerDay: number;
}

export interface HourlyUsagePattern {
  hour: number; // 0-23
  totalClicks: number;
  uniqueUrls: number;
  topUrls: Array<{
    urlId: ID;
    clicks: number;
  }>;
}

export interface UserStatistics {
  totalClicks: number;
  totalUniqueUrls: number;
  mostActiveHour: number;
  leastActiveHour: number;
  clicksByHour: Record<number, number>;
  topUrls: Array<{
    urlId: ID;
    clicks: number;
    percentage: number;
  }>;
  usageByDay: Record<string, number>; // YYYY-MM-DD -> click count
}
