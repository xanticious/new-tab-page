"use client";

import React, { useState, useRef } from "react";
import {
  useProfiles,
  useCategories,
  useUrls,
  useTags,
  usePictures,
} from "@/hooks/useDatabase";
import { BackToSettingsLink, FormHeader } from "@/components";
import { db } from "@/lib/db";
import type {
  Profile,
  Category,
  Url,
  Tag,
  Picture,
  ExportData,
  ImportResult,
  ID,
} from "@/types";

const ManageImportExport = () => {
  const { profiles, refresh: refreshProfiles } = useProfiles();
  const { categories, refresh: refreshCategories } = useCategories();
  const { urls, refresh: refreshUrls } = useUrls();
  const { tags, refresh: refreshTags } = useTags();
  const { pictures, refresh: refreshPictures } = usePictures();

  const [selectedProfileId, setSelectedProfileId] = useState<ID>("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to download JSON data as file
  const downloadAsJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export everything
  const handleExportEverything = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const exportData: ExportData = {
        version: "1.0.0",
        exportedAt: new Date(),
        profiles,
        categories,
        urls,
        tags,
        pictures,
        themes: [], // We'll support themes later
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadAsJson(exportData, `new-tab-page-complete-${timestamp}.json`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Export specific profile
  const handleExportProfile = async () => {
    if (!selectedProfileId) {
      setError("Please select a profile to export");
      return;
    }

    try {
      setIsExporting(true);
      setError(null);

      const profile = profiles.find((p) => p.id === selectedProfileId);
      if (!profile) {
        throw new Error("Selected profile not found");
      }

      // Use the database API to get all related data for the profile
      const profileData = await db.exportProfile(selectedProfileId);

      const exportData: ExportData = {
        version: "1.0.0",
        exportedAt: new Date(),
        profiles: profileData.profiles,
        categories: profileData.categories,
        urls: profileData.urls,
        tags: profileData.tags,
        pictures: profileData.pictures,
        themes: profileData.themes,
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeName = profile.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      downloadAsJson(
        exportData,
        `new-tab-page-profile-${safeName}-${timestamp}.json`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export profile");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);
      setImportResult(null);

      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      // Validate the import data structure
      if (
        !importData.version ||
        !importData.profiles ||
        !Array.isArray(importData.profiles)
      ) {
        throw new Error(
          "Invalid import file format. Please ensure you're importing a valid New Tab Page export file."
        );
      }

      // Check version compatibility (for future use)
      if (importData.version !== "1.0.0") {
        console.warn(
          `Importing data from version ${importData.version}, current version is 1.0.0`
        );
      }

      const result: ImportResult = {
        success: true,
        importedCount: {
          profiles: 0,
          categories: 0,
          urls: 0,
          tags: 0,
          pictures: 0,
          themes: 0,
        },
        errors: [],
      };

      // ID mapping objects to maintain relationships
      const importedPicturesMap: Record<ID, ID> = {}; // old id -> new id
      const importedTagsMap: Record<ID, ID> = {}; // old id -> new id
      const importedUrlsMap: Record<ID, ID> = {}; // old id -> new id
      const importedCategoriesMap: Record<ID, ID> = {}; // old id -> new id
      const importedThemesMap: Record<ID, ID> = {}; // old id -> new id (for future use)

      // Import pictures first (other items might reference them)
      if (importData.pictures && Array.isArray(importData.pictures)) {
        for (const picture of importData.pictures) {
          try {
            // Skip if readonly (user can't import readonly items)
            if (picture.readonly) continue;

            // Create new picture with new ID to avoid conflicts
            const newPicture = await db.pictures.create({
              name: picture.name,
              base64ImageData: picture.base64ImageData,
              altText: picture.altText,
            });

            // Map old ID to new ID
            importedPicturesMap[picture.id] = newPicture.id;
            result.importedCount.pictures++;
          } catch (err) {
            result.errors.push(
              `Failed to import picture "${picture.name}": ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      // Import tags
      if (importData.tags && Array.isArray(importData.tags)) {
        for (const tag of importData.tags) {
          try {
            if (tag.readonly) continue;

            const newTag = await db.tags.create({
              name: tag.name,
              synonyms: tag.synonyms || [],
            });

            // Map old ID to new ID
            importedTagsMap[tag.id] = newTag.id;
            result.importedCount.tags++;
          } catch (err) {
            result.errors.push(
              `Failed to import tag "${tag.name}": ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      // Import URLs (with mapped tag and picture references)
      if (importData.urls && Array.isArray(importData.urls)) {
        for (const url of importData.urls) {
          try {
            if (url.readonly) continue;

            // Map tag IDs to new imported tag IDs
            const mappedTags = (url.tags || [])
              .map((tagId) => importedTagsMap[tagId])
              .filter(Boolean); // Remove undefined values

            // Map picture ID to new imported picture ID
            const mappedPictureId = url.picture
              ? importedPicturesMap[url.picture]
              : undefined;

            // Log warnings for missing references
            if (url.tags && url.tags.length > mappedTags.length) {
              console.warn(
                `URL "${url.name}": Some tags were not found in import data and will be skipped`
              );
            }
            if (url.picture && !mappedPictureId) {
              console.warn(
                `URL "${url.name}": Referenced picture not found in import data`
              );
            }

            const newUrl = await db.urls.create({
              name: url.name,
              url: url.url,
              tags: mappedTags,
              picture: mappedPictureId,
            });

            // Map old ID to new ID
            importedUrlsMap[url.id] = newUrl.id;
            result.importedCount.urls++;
          } catch (err) {
            result.errors.push(
              `Failed to import URL "${url.name}": ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      // Import categories (with mapped URL references)
      if (importData.categories && Array.isArray(importData.categories)) {
        for (const category of importData.categories) {
          try {
            if (category.readonly) continue;

            // Map URL IDs to new imported URL IDs
            const mappedUrls = (category.urls || [])
              .map((urlId) => importedUrlsMap[urlId])
              .filter(Boolean); // Remove undefined values

            // Log warnings for missing references
            if (category.urls && category.urls.length > mappedUrls.length) {
              console.warn(
                `Category "${category.name}": Some URLs were not found in import data and will be skipped`
              );
            }

            const newCategory = await db.categories.create({
              name: category.name,
              urls: mappedUrls,
            });

            // Map old ID to new ID
            importedCategoriesMap[category.id] = newCategory.id;
            result.importedCount.categories++;
          } catch (err) {
            result.errors.push(
              `Failed to import category "${category.name}": ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      // Import profiles (with mapped category and theme references)
      if (importData.profiles && Array.isArray(importData.profiles)) {
        for (const profile of importData.profiles) {
          try {
            if (profile.readonly) continue;

            // Map category IDs to new imported category IDs
            const mappedCategories = (profile.categories || [])
              .map((categoryId) => importedCategoriesMap[categoryId])
              .filter(Boolean); // Remove undefined values

            // Log warnings for missing references
            if (
              profile.categories &&
              profile.categories.length > mappedCategories.length
            ) {
              console.warn(
                `Profile "${profile.name}": Some categories were not found in import data and will be skipped`
              );
            }

            // For theme, we'll use the original theme ID for now since we're not importing themes yet
            // In the future, this would be: importedThemesMap[profile.theme] || profile.theme
            const themeId = profile.theme;

            await db.profiles.create({
              name: profile.name,
              categories: mappedCategories,
              includeRecentCategory: profile.includeRecentCategory ?? true,
              numRecentToShow: profile.numRecentToShow ?? 5,
              theme: themeId,
            });
            result.importedCount.profiles++;
          } catch (err) {
            result.errors.push(
              `Failed to import profile "${profile.name}": ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
          }
        }
      }

      setImportResult(result);

      // Add relationship mapping info for debugging
      if (result.success) {
        console.log("Import completed with ID mappings:", {
          pictures: importedPicturesMap,
          tags: importedTagsMap,
          urls: importedUrlsMap,
          categories: importedCategoriesMap,
        });
      }

      // Refresh all data to show the imported items
      await Promise.all([
        refreshProfiles(),
        refreshCategories(),
        refreshUrls(),
        refreshTags(),
        refreshPictures(),
      ]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import data");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BackToSettingsLink />

        <FormHeader
          title="Import & Export"
          subtitle="Export your data for backup or import data from a backup file"
        />

        <div className="space-y-8">
          {/* Export Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Export Data</h2>

            <div className="space-y-4">
              {/* Export Everything */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Export Everything</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Export all profiles, categories, URLs, tags, and pictures.
                  This includes both preloaded and user-created data.
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Note: Statistics and click events are not included in exports.
                </div>
                <button
                  onClick={handleExportEverything}
                  disabled={isExporting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? "Exporting..." : "Export All Data"}
                </button>
              </div>{" "}
              {/* Export Profile */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Export Specific Profile</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Export a single profile with its categories, URLs, tags, and
                  pictures. Only data related to the selected profile will be
                  included.
                </p>

                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label
                      htmlFor="profile-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Select Profile
                    </label>
                    <select
                      id="profile-select"
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a profile...</option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name} {profile.readonly && "(readonly)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExportProfile}
                    disabled={isExporting || !selectedProfileId}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? "Exporting..." : "Export Profile"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Import Data</h2>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Import from JSON File</h3>
              <p className="text-gray-600 text-sm mb-2">
                Import data from a previously exported JSON file. Only
                user-created items will be imported (readonly items are
                skipped).
              </p>
              <div className="text-xs text-green-600 mb-2">
                ✅ Relationships between items are automatically maintained
                during import.
              </div>
              <div className="text-xs text-amber-600 mb-4">
                ⚠️ Warning: This will create new items alongside your existing
                data. It will not overwrite existing items.
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                </div>

                {isImporting && (
                  <div className="text-blue-600">
                    Importing data, please wait...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Import Results</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Profiles</div>
                    <div className="text-green-600">
                      {importResult.importedCount.profiles} imported
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Categories</div>
                    <div className="text-green-600">
                      {importResult.importedCount.categories} imported
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">URLs</div>
                    <div className="text-green-600">
                      {importResult.importedCount.urls} imported
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Tags</div>
                    <div className="text-green-600">
                      {importResult.importedCount.tags} imported
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Pictures</div>
                    <div className="text-green-600">
                      {importResult.importedCount.pictures} imported
                    </div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-red-800 font-medium mb-2">
                      Import Errors
                    </h3>
                    <ul className="text-red-600 text-sm space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="text-red-800 font-medium">Error</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageImportExport;
