"use client";

import React, { useState, useEffect } from "react";
import { useUrls } from "@/hooks/useDatabase";
import { useTags } from "@/hooks/useDatabase";
import { usePictures } from "@/hooks/useDatabase";
import { Url, CreateUrl, UpdateUrl, Tag, Picture } from "@/types";
import {
  BackToSettingsLink,
  FormHeader,
  SearchBar,
  StatsCard,
  SearchablePictureSelector,
} from "@/components";

// Icons
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

const TagIcon = ({ className }: { className?: string }) => (
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
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

type ViewMode = "list" | "create" | "edit" | "view";

interface UrlFormData {
  name: string;
  url: string;
  tags: string[];
  picture?: string;
}

export default function UrlsManagementPage() {
  const {
    urls,
    isLoading: urlsLoading,
    error: urlsError,
    createUrl,
    updateUrl,
    deleteUrl,
    refresh: refreshUrls,
  } = useUrls();

  const { tags, isLoading: tagsLoading, error: tagsError } = useTags();

  const {
    pictures,
    isLoading: picturesLoading,
    error: picturesError,
  } = usePictures();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedUrl, setSelectedUrl] = useState<Url | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<UrlFormData>({
    name: "",
    url: "",
    tags: [],
    picture: undefined,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = urlsLoading || tagsLoading || picturesLoading;
  const error = urlsError || tagsError || picturesError;

  // Create lookup maps for efficiency
  const tagsMap = tags.reduce((map, tag) => {
    map[tag.id] = tag;
    return map;
  }, {} as Record<string, Tag>);

  const picturesMap = pictures.reduce((map, picture) => {
    map[picture.id] = picture;
    return map;
  }, {} as Record<string, Picture>);

  // Filter URLs based on search term
  const filteredUrls = urls.filter(
    (url) =>
      url.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.tags.some((tagId) =>
        tagsMap[tagId]?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      setFormData({ name: "", url: "", tags: [], picture: undefined });
      setSelectedUrl(null);
    } else if (viewMode === "edit" && selectedUrl) {
      setFormData({
        name: selectedUrl.name,
        url: selectedUrl.url,
        tags: selectedUrl.tags,
        picture: selectedUrl.picture,
      });
    }
    setFormErrors({});
  }, [viewMode, selectedUrl]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "URL name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "URL name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current URL when editing)
      const existingUrl = urls.find(
        (url) =>
          url.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || url.id !== selectedUrl?.id)
      );
      if (existingUrl) {
        errors.name = "A URL with this name already exists";
      }
    }

    if (!formData.url.trim()) {
      errors.url = "URL is required";
    } else {
      try {
        new URL(formData.url.trim());
      } catch {
        errors.url = "Please enter a valid URL (e.g., https://example.com)";
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
      const urlData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        tags: formData.tags,
        picture: formData.picture || undefined,
      };

      if (viewMode === "create") {
        await createUrl(urlData as CreateUrl);
      } else if (viewMode === "edit" && selectedUrl) {
        await updateUrl({
          id: selectedUrl.id,
          ...urlData,
        } as UpdateUrl);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save URL:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (url: Url) => {
    if (url.readonly) return;

    if (confirm(`Are you sure you want to delete the URL "${url.name}"?`)) {
      try {
        await deleteUrl(url.id);
      } catch (err) {
        console.error("Failed to delete URL:", err);
      }
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading URLs...</div>
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
            <div className="text-red-800">Error loading URLs: {error}</div>
            <button
              onClick={refreshUrls}
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
            title="URLs Management"
            subtitle="Manage your bookmarked URLs and organize them with tags and pictures"
            icon={LinkIcon}
            actionButton={
              viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add URL
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
                  placeholder="Search URLs by name, URL, or tags..."
                />

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total URLs"
                    value={urls.length}
                    bgColor="bg-blue-50"
                    textColor="text-blue-600"
                    borderColor="border-blue-200"
                  />
                  <StatsCard
                    title="Editable URLs"
                    value={urls.filter((u) => !u.readonly).length}
                    bgColor="bg-green-50"
                    textColor="text-green-600"
                    borderColor="border-green-200"
                  />
                  <StatsCard
                    title="Readonly URLs"
                    value={urls.filter((u) => u.readonly).length}
                    bgColor="bg-gray-50"
                    textColor="text-gray-600"
                    borderColor="border-gray-200"
                  />
                </div>

                {/* URLs List */}
                <div className="space-y-3">
                  {filteredUrls.length === 0 ? (
                    <div className="text-center py-12">
                      <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? "No URLs found" : "No URLs yet"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {searchTerm
                          ? "Try adjusting your search terms."
                          : "Get started by adding your first URL."}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setViewMode("create")}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Add Your First URL
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredUrls.map((url) => (
                      <div
                        key={url.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              {/* Picture */}
                              {url.picture && picturesMap[url.picture] && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={
                                      picturesMap[url.picture].base64ImageData
                                    }
                                    alt={picturesMap[url.picture].altText}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                </div>
                              )}

                              {/* Name and URL */}
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {url.name}
                                </h3>
                                <a
                                  href={url.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 truncate"
                                >
                                  {url.url}
                                  <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                                </a>
                              </div>
                            </div>

                            {/* Tags */}
                            {url.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {url.tags.map((tagId) => {
                                  const tag = tagsMap[tagId];
                                  return tag ? (
                                    <span
                                      key={tagId}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                    >
                                      <TagIcon className="h-3 w-3" />
                                      {tag.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}

                            {/* Readonly badge */}
                            {url.readonly && (
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Read-only
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedUrl(url);
                                setViewMode("view");
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View URL"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {!url.readonly && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUrl(url);
                                    setViewMode("edit");
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit URL"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(url)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete URL"
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
                  {viewMode === "create" ? "Add New URL" : "Edit URL"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and URL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Name *
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
                        placeholder="e.g., Google Search"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL *
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            url: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                      {formErrors.url && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.url}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Picture Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Picture (Optional)
                    </label>
                    <SearchablePictureSelector
                      pictures={pictures}
                      selectedPictureId={formData.picture}
                      onSelect={(pictureId) =>
                        setFormData((prev) => ({
                          ...prev,
                          picture: pictureId,
                        }))
                      }
                      placeholder="Search for a picture..."
                    />
                  </div>

                  {/* Tags Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag.id)}
                            onChange={() => handleTagToggle(tag.id)}
                            className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 flex-1">
                            {tag.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Select tags to help categorize and filter this URL
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
                        ? "Create URL"
                        : "Update URL"}
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

            {viewMode === "view" && selectedUrl && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  View URL
                </h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-start gap-4">
                    {selectedUrl.picture &&
                      picturesMap[selectedUrl.picture] && (
                        <div className="flex-shrink-0">
                          <img
                            src={
                              picturesMap[selectedUrl.picture].base64ImageData
                            }
                            alt={picturesMap[selectedUrl.picture].altText}
                            className="w-16 h-16 rounded object-cover border border-gray-200"
                          />
                        </div>
                      )}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedUrl.name}
                      </h3>
                      <a
                        href={selectedUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 break-all"
                      >
                        {selectedUrl.url}
                        <ExternalLinkIcon className="h-4 w-4 flex-shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedUrl.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUrl.tags.map((tagId) => {
                          const tag = tagsMap[tagId];
                          return tag ? (
                            <span
                              key={tagId}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              <TagIcon className="h-3 w-3" />
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                    <p>URL ID: {selectedUrl.id}</p>
                    {selectedUrl.readonly && (
                      <p className="text-blue-600">This URL is read-only</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  {!selectedUrl.readonly && (
                    <button
                      onClick={() => setViewMode("edit")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit URL
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
