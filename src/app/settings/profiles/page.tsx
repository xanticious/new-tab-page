"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useProfiles, useCategories, useThemes } from "@/hooks/useDatabase";
import {
  Profile,
  CreateProfile,
  UpdateProfile,
  Category,
  Theme,
} from "@/types";
import {
  BackToSettingsLink,
  FormHeader,
  SearchBar,
  StatsCard,
} from "@/components";

// Icons
const UserGroupIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const BarsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

// Types for component state
type ViewMode = "list" | "create" | "edit" | "view";

interface ProfileFormData {
  name: string;
  categories: string[];
  includeRecentCategory: boolean;
  numRecentToShow: number;
  theme: string;
}

interface DragState {
  draggedIndex: number | null;
  draggedOverIndex: number | null;
}

export default function ProfilesManagementPage() {
  const {
    profiles,
    isLoading: profilesLoading,
    error: profilesError,
    createProfile,
    updateProfile,
    deleteProfile,
    refresh: refreshProfiles,
  } = useProfiles();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const { themes, isLoading: themesLoading, error: themesError } = useThemes();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    categories: [],
    includeRecentCategory: true,
    numRecentToShow: 5,
    theme: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    draggedIndex: null,
    draggedOverIndex: null,
  });

  const isLoading = profilesLoading || categoriesLoading || themesLoading;
  const error = profilesError || categoriesError || themesError;

  // Create lookup maps for efficiency
  const categoriesMap = categories.reduce((map, category) => {
    map[category.id] = category;
    return map;
  }, {} as Record<string, Category>);

  const themesMap = themes.reduce((map, theme) => {
    map[theme.id] = theme;
    return map;
  }, {} as Record<string, Theme>);

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      const defaultTheme = themes.find((t) => t.id === "theme_default");
      setFormData({
        name: "",
        categories: [],
        includeRecentCategory: true,
        numRecentToShow: 5,
        theme: defaultTheme?.id || themes[0]?.id || "",
      });
      setSelectedProfile(null);
    } else if (viewMode === "edit" && selectedProfile) {
      setFormData({
        name: selectedProfile.name,
        categories: [...selectedProfile.categories],
        includeRecentCategory: selectedProfile.includeRecentCategory,
        numRecentToShow: selectedProfile.numRecentToShow,
        theme: selectedProfile.theme,
      });
    }
    setFormErrors({});
  }, [viewMode, selectedProfile, themes]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Profile name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Profile name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current profile when editing)
      const existingProfile = profiles.find(
        (profile) =>
          profile.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || profile.id !== selectedProfile?.id)
      );
      if (existingProfile) {
        errors.name = "A profile with this name already exists";
      }
    }

    if (!formData.theme) {
      errors.theme = "Please select a theme";
    }

    if (formData.numRecentToShow < 0 || formData.numRecentToShow > 50) {
      errors.numRecentToShow = "Number must be between 0 and 50";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const profileData = {
        name: formData.name.trim(),
        categories: formData.categories,
        includeRecentCategory: formData.includeRecentCategory,
        numRecentToShow: formData.numRecentToShow,
        theme: formData.theme,
      };

      if (viewMode === "create") {
        await createProfile(profileData as CreateProfile);
      } else if (viewMode === "edit" && selectedProfile) {
        await updateProfile({
          id: selectedProfile.id,
          ...profileData,
        } as UpdateProfile);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (profile: Profile) => {
    if (profile.readonly) return;

    if (
      confirm(`Are you sure you want to delete the profile "${profile.name}"?`)
    ) {
      try {
        await deleteProfile(profile.id);
      } catch (err) {
        console.error("Failed to delete profile:", err);
      }
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  // Drag and drop handlers for category reordering
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragState((prev) => ({ ...prev, draggedIndex: index }));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragState((prev) => ({ ...prev, draggedOverIndex: index }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState((prev) => ({ ...prev, draggedOverIndex: null }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const { draggedIndex } = dragState;

      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDragState({ draggedIndex: null, draggedOverIndex: null });
        return;
      }

      setFormData((prev) => {
        const newCategories = [...prev.categories];
        const draggedItem = newCategories[draggedIndex];

        // Remove the dragged item
        newCategories.splice(draggedIndex, 1);

        // Insert at the new position
        const insertIndex =
          draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newCategories.splice(insertIndex, 0, draggedItem);

        return { ...prev, categories: newCategories };
      });

      setDragState({ draggedIndex: null, draggedOverIndex: null });
    },
    [dragState]
  );

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedIndex: null, draggedOverIndex: null });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading profiles...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error loading profiles: {error}</div>
            <button
              onClick={refreshProfiles}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToSettingsLink />

        <div className="bg-white rounded-lg shadow-sm border">
          <FormHeader
            title="Profiles Management"
            subtitle="Create and manage different user contexts with customized category sets and themes"
            icon={UserGroupIcon}
            actionButton={
              viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Profile
                </button>
              )
            }
            onBack={viewMode !== "list" ? () => setViewMode("list") : undefined}
          />

          {/* Content */}
          <div className="p-6">
            {viewMode === "list" && (
              <div className="space-y-6">
                {/* Search */}
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search profiles by name..."
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Profiles"
                    value={profiles.length}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-blue-200"
                  />
                  <StatsCard
                    title="Editable Profiles"
                    value={profiles.filter((p) => !p.readonly).length}
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                    borderColor="border-green-200"
                  />
                  <StatsCard
                    title="Readonly Profiles"
                    value={profiles.filter((p) => p.readonly).length}
                    bgColor="bg-gray-50"
                    textColor="text-gray-600"
                    borderColor="border-gray-200"
                  />
                </div>

                {/* Profiles List */}
                <div className="space-y-3">
                  {filteredProfiles.length === 0 ? (
                    <div className="text-center py-12">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No profiles found" : "No profiles yet"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm
                          ? "Try adjusting your search terms."
                          : "Get started by creating your first profile."}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setViewMode("create")}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Add Your First Profile
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <UserGroupIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {profile.name}
                                </h3>
                                <div className="text-sm text-gray-600">
                                  {profile.categories.length} categor
                                  {profile.categories.length !== 1
                                    ? "ies"
                                    : "y"}
                                  {profile.includeRecentCategory &&
                                    ` • Recent: ${profile.numRecentToShow}`}
                                  {themesMap[profile.theme] &&
                                    ` • ${themesMap[profile.theme].name}`}
                                </div>
                              </div>
                            </div>

                            {/* Categories preview */}
                            {profile.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {profile.categories
                                  .slice(0, 5)
                                  .map((categoryId) => {
                                    const category = categoriesMap[categoryId];
                                    return category ? (
                                      <span
                                        key={categoryId}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                      >
                                        <FolderIcon className="h-3 w-3" />
                                        {category.name}
                                      </span>
                                    ) : null;
                                  })}
                                {profile.categories.length > 5 && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{profile.categories.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Readonly badge */}
                            {profile.readonly && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Read-only
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedProfile(profile);
                                setViewMode("view");
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {!profile.readonly && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedProfile(profile);
                                    setViewMode("edit");
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Profile"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(profile)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Profile"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {(viewMode === "create" || viewMode === "edit") && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {viewMode === "create" ? "Add New Profile" : "Edit Profile"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Work Profile"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme *
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theme: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a theme...</option>
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.theme && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.theme}
                      </p>
                    )}
                  </div>

                  {/* Recent Category Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="includeRecentCategory"
                        checked={formData.includeRecentCategory}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            includeRecentCategory: e.target.checked,
                          }))
                        }
                        className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="includeRecentCategory"
                        className="text-sm font-medium text-gray-700"
                      >
                        Include Recent Category
                      </label>
                    </div>
                    {formData.includeRecentCategory && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Recent URLs to Show
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={formData.numRecentToShow}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              numRecentToShow: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.numRecentToShow && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.numRecentToShow}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Categories Selection with Drag and Drop */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categories
                    </label>
                    <p className="text-sm text-gray-500 mb-4">
                      Select categories to include in this profile. You can drag
                      to reorder them.
                    </p>

                    {/* Available Categories */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Available Categories
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {categories
                          .filter(
                            (category) =>
                              !formData.categories.includes(category.id)
                          )
                          .map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() =>
                                  handleCategoryToggle(category.id)
                                }
                                className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <FolderIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700 flex-1 truncate">
                                {category.name}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>

                    {/* Selected Categories (Draggable) */}
                    {formData.categories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Selected Categories (drag to reorder)
                        </h4>
                        <div className="space-y-2">
                          {formData.categories.map((categoryId, index) => {
                            const category = categoriesMap[categoryId];
                            if (!category) return null;

                            const isDragging = dragState.draggedIndex === index;
                            const isDraggedOver =
                              dragState.draggedOverIndex === index;

                            return (
                              <div
                                key={categoryId}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-move transition-all ${
                                  isDragging
                                    ? "opacity-50 scale-95"
                                    : isDraggedOver
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <BarsIcon className="h-4 w-4 text-gray-400" />
                                <FolderIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-700 flex-1">
                                  {category.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCategoryToggle(categoryId)
                                  }
                                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove category"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : viewMode === "create"
                        ? "Create Profile"
                        : "Update Profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {viewMode === "view" && selectedProfile && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  View Profile
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <UserGroupIcon className="h-12 w-12 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedProfile.name}
                      </h3>
                      <div className="text-gray-600 space-y-1">
                        <p>
                          <strong>Categories:</strong>{" "}
                          {selectedProfile.categories.length}
                        </p>
                        <p>
                          <strong>Theme:</strong>{" "}
                          {themesMap[selectedProfile.theme]?.name || "Unknown"}
                        </p>
                        <p>
                          <strong>Recent Category:</strong>{" "}
                          {selectedProfile.includeRecentCategory
                            ? `Yes (${selectedProfile.numRecentToShow} URLs)`
                            : "No"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  {selectedProfile.categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Categories (in order)
                      </h4>
                      <div className="space-y-2">
                        {selectedProfile.categories.map((categoryId, index) => {
                          const category = categoriesMap[categoryId];
                          return category ? (
                            <div
                              key={categoryId}
                              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              <span className="text-sm text-gray-500 w-6">
                                {index + 1}.
                              </span>
                              <FolderIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-700">
                                {category.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {category.urls.length} URL
                                {category.urls.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          ) : (
                            <div
                              key={categoryId}
                              className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                            >
                              <span className="text-sm text-gray-500 w-6">
                                {index + 1}.
                              </span>
                              <span className="text-sm text-red-600">
                                Category not found (ID: {categoryId})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedProfile.categories.length === 0 && (
                    <div className="text-center py-8">
                      <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No categories selected for this profile
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                    <p>Profile ID: {selectedProfile.id}</p>
                    {selectedProfile.readonly && (
                      <p className="text-blue-600">This profile is read-only</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {!selectedProfile.readonly && (
                    <button
                      onClick={() => setViewMode("edit")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode("list")}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
