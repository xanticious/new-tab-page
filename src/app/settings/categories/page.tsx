"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCategories } from "@/hooks/useDatabase";
import { useUrls } from "@/hooks/useDatabase";
import { usePictures } from "@/hooks/useDatabase";
import {
  Category,
  CreateCategory,
  UpdateCategory,
  Url,
  Picture,
} from "@/types";
import {
  BackToSettingsLink,
  FormHeader,
  SearchBar,
  StatsCard,
  SearchableUrlSelector,
} from "@/components";

// Icons
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

const ExternalLinkIcon = ({ className }: { className?: string }) => (
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
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
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
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

// Types for component state
type ViewMode = "list" | "create" | "edit" | "view";

interface CategoryFormData {
  name: string;
  urls: string[];
}

export default function CategoriesManagementPage() {
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: refreshCategories,
  } = useCategories();

  const { urls, isLoading: urlsLoading, error: urlsError } = useUrls();

  const {
    pictures,
    isLoading: picturesLoading,
    error: picturesError,
  } = usePictures();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    urls: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = categoriesLoading || urlsLoading || picturesLoading;
  const error = categoriesError || urlsError || picturesError;

  // Create lookup maps for efficiency
  const urlsMap = urls.reduce((map, url) => {
    map[url.id] = url;
    return map;
  }, {} as Record<string, Url>);

  const picturesMap = pictures.reduce((map, picture) => {
    map[picture.id] = picture;
    return map;
  }, {} as Record<string, Picture>);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      setFormData({ name: "", urls: [] });
      setSelectedCategory(null);
    } else if (viewMode === "edit" && selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        urls: selectedCategory.urls,
      });
    }
    setFormErrors({});
  }, [viewMode, selectedCategory]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current category when editing)
      const existingCategory = categories.find(
        (category) =>
          category.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || category.id !== selectedCategory?.id)
      );
      if (existingCategory) {
        errors.name = "A category with this name already exists";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: formData.name.trim(),
        urls: formData.urls,
      };

      if (viewMode === "create") {
        await createCategory(categoryData as CreateCategory);
      } else if (viewMode === "edit" && selectedCategory) {
        await updateCategory({
          id: selectedCategory.id,
          ...categoryData,
        } as UpdateCategory);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (category.readonly) return;

    if (
      confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      try {
        await deleteCategory(category.id);
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading categories...</div>
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
            <div className="text-red-800">
              Error loading categories: {error}
            </div>
            <button
              onClick={refreshCategories}
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
            title="Categories Management"
            subtitle="Organize your URLs into categories for better structure and navigation"
            icon={FolderIcon}
            actionButton={
              viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Category
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
                  placeholder="Search categories by name..."
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Categories"
                    value={categories.length}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-blue-200"
                  />
                  <StatsCard
                    title="Editable Categories"
                    value={categories.filter((c) => !c.readonly).length}
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                    borderColor="border-green-200"
                  />
                  <StatsCard
                    title="Readonly Categories"
                    value={categories.filter((c) => c.readonly).length}
                    bgColor="bg-gray-50"
                    textColor="text-gray-600"
                    borderColor="border-gray-200"
                  />
                </div>

                {/* Categories List */}
                <div className="space-y-3">
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm
                          ? "No categories found"
                          : "No categories yet"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm
                          ? "Try adjusting your search terms."
                          : "Get started by creating your first category."}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setViewMode("create")}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Add Your First Category
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <FolderIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {category.urls.length} URL
                                  {category.urls.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            {/* URLs Preview */}
                            {category.urls.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {category.urls.slice(0, 5).map((urlId) => {
                                  const url = urlsMap[urlId];
                                  return url ? (
                                    <div
                                      key={urlId}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      {url.picture &&
                                        picturesMap[url.picture] && (
                                          <Image
                                            src={
                                              picturesMap[url.picture]
                                                .base64ImageData
                                            }
                                            alt={
                                              picturesMap[url.picture].altText
                                            }
                                            width={12}
                                            height={12}
                                            className="w-3 h-3 rounded object-cover"
                                          />
                                        )}
                                      <LinkIcon className="h-3 w-3" />
                                      <span className="truncate max-w-20">
                                        {url.name}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                                {category.urls.length > 5 && (
                                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                    +{category.urls.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Readonly badge */}
                            {category.readonly && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Read-only
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedCategory(category);
                                setViewMode("view");
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Category"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {!category.readonly && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setViewMode("edit");
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Category"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(category)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Category"
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
                  {viewMode === "create" ? "Add New Category" : "Edit Category"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
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
                      placeholder="e.g., Development Tools"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* URLs Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URLs
                    </label>
                    <SearchableUrlSelector
                      urls={urls}
                      pictures={pictures}
                      selectedUrlIds={formData.urls}
                      onSelectionChange={(urlIds) =>
                        setFormData((prev) => ({
                          ...prev,
                          urls: urlIds,
                        }))
                      }
                      placeholder="Search and select URLs for this category..."
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Select URLs to include in this category. You can search by
                      name or URL.
                    </p>
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
                        ? "Create Category"
                        : "Update Category"}
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

            {viewMode === "view" && selectedCategory && (
              <div className="max-w-4xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  View Category
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    <FolderIcon className="h-12 w-12 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedCategory.name}
                      </h3>
                      <p className="text-gray-600">
                        Contains {selectedCategory.urls.length} URL
                        {selectedCategory.urls.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* URLs */}
                  {selectedCategory.urls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        URLs in this category
                      </h4>
                      <div className="space-y-2">
                        {selectedCategory.urls.map((urlId) => {
                          const url = urlsMap[urlId];
                          return url ? (
                            <div
                              key={urlId}
                              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                            >
                              {url.picture && picturesMap[url.picture] && (
                                <Image
                                  src={picturesMap[url.picture].base64ImageData}
                                  alt={picturesMap[url.picture].altText}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {url.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {url.url}
                                </div>
                              </div>
                              <a
                                href={url.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Open URL"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                              </a>
                            </div>
                          ) : (
                            <div
                              key={urlId}
                              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                            >
                              URL not found (ID: {urlId})
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedCategory.urls.length === 0 && (
                    <div className="text-center py-8">
                      <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No URLs in this category yet
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                    <p>Category ID: {selectedCategory.id}</p>
                    {selectedCategory.readonly && (
                      <p className="text-blue-600">
                        This category is read-only
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {!selectedCategory.readonly && (
                    <button
                      onClick={() => setViewMode("edit")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Category
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
