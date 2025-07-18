"use client";

import React, { useState, useEffect } from "react";
import { useTags } from "@/hooks/useDatabase";
import { BackToSettingsLink } from "@/components";
import { Tag, CreateTag, UpdateTag, ID } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  TagIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface TagFormData {
  name: string;
  synonyms: string[];
}

type ViewMode = "list" | "create" | "edit" | "view";

export default function TagsManagementPage() {
  const { tags, isLoading, error, createTag, updateTag, deleteTag, refresh } =
    useTags();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    synonyms: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [synonymInput, setSynonymInput] = useState("");

  // Filter tags based on search term
  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.synonyms.some((synonym) =>
        synonym.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      setFormData({ name: "", synonyms: [] });
      setSelectedTag(null);
    } else if (viewMode === "edit" && selectedTag) {
      setFormData({
        name: selectedTag.name,
        synonyms: [...selectedTag.synonyms],
      });
    }
    setFormErrors({});
    setSynonymInput("");
  }, [viewMode, selectedTag]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Tag name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Tag name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current tag when editing)
      const existingTag = tags.find(
        (tag) =>
          tag.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || tag.id !== selectedTag?.id)
      );
      if (existingTag) {
        errors.name = "A tag with this name already exists";
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
      const tagData = {
        name: formData.name.trim(),
        synonyms: formData.synonyms.filter((s) => s.trim().length > 0),
      };

      if (viewMode === "create") {
        await createTag(tagData as CreateTag);
      } else if (viewMode === "edit" && selectedTag) {
        await updateTag({
          id: selectedTag.id,
          ...tagData,
        } as UpdateTag);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save tag:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (tag.readonly) return;

    if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      try {
        await deleteTag(tag.id);
      } catch (err) {
        console.error("Failed to delete tag:", err);
      }
    }
  };

  const handleCopy = (tag: Tag) => {
    setFormData({
      name: `${tag.name} (Copy)`,
      synonyms: [...tag.synonyms],
    });
    setSelectedTag(null);
    setViewMode("create");
  };

  const addSynonym = () => {
    const synonym = synonymInput.trim();
    if (synonym && !formData.synonyms.includes(synonym)) {
      setFormData({
        ...formData,
        synonyms: [...formData.synonyms, synonym],
      });
      setSynonymInput("");
    }
  };

  const removeSynonym = (index: number) => {
    setFormData({
      ...formData,
      synonyms: formData.synonyms.filter((_, i) => i !== index),
    });
  };

  const handleSynonymKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSynonym();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading tags...</div>
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
            <div className="text-red-800">Error loading tags: {error}</div>
            <button
              onClick={refresh}
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
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TagIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Tags Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage tags for organizing and categorizing your URLs
                  </p>
                </div>
              </div>

              {viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create Tag
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === "list" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-blue-600">
                      {tags.length}
                    </div>
                    <div className="text-blue-700">Total Tags</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-green-600">
                      {tags.filter((t) => !t.readonly).length}
                    </div>
                    <div className="text-green-700">Editable Tags</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl font-semibold text-gray-600">
                      {tags.filter((t) => t.readonly).length}
                    </div>
                    <div className="text-gray-700">Readonly Tags</div>
                  </div>
                </div>

                {/* Tags List */}
                <div className="space-y-3">
                  {filteredTags.length === 0 ? (
                    <div className="text-center py-12">
                      <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-gray-500">
                        {searchTerm
                          ? "No tags found matching your search"
                          : "No tags found"}
                      </div>
                      {!searchTerm && (
                        <button
                          onClick={() => setViewMode("create")}
                          className="mt-4 text-blue-600 hover:text-blue-800 underline"
                        >
                          Create your first tag
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {tag.name}
                              </h3>
                              {tag.readonly && (
                                <LockClosedIcon className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            {tag.synonyms.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-sm text-gray-500">
                                  Synonyms:
                                </span>
                                {tag.synonyms.map((synonym, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                                  >
                                    {synonym}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTag(tag);
                                setViewMode("view");
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View tag"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleCopy(tag)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Copy tag"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>

                            {!tag.readonly && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedTag(tag);
                                    setViewMode("edit");
                                  }}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit tag"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleDelete(tag)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete tag"
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
              <div className="max-w-2xl">
                <div className="mb-6">
                  <button
                    onClick={() => setViewMode("list")}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                  >
                    ← Back to Tags List
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900 mt-4">
                    {viewMode === "create" ? "Create New Tag" : "Edit Tag"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter tag name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Synonyms
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={synonymInput}
                          onChange={(e) => setSynonymInput(e.target.value)}
                          onKeyPress={handleSynonymKeyPress}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add a synonym"
                        />
                        <button
                          type="button"
                          onClick={addSynonym}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Add
                        </button>
                      </div>

                      {formData.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.synonyms.map((synonym, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                            >
                              {synonym}
                              <button
                                type="button"
                                onClick={() => removeSynonym(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Synonyms help with search and filtering. Press Enter or
                      click Add to add a synonym.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : viewMode === "create"
                        ? "Create Tag"
                        : "Update Tag"}
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

            {viewMode === "view" && selectedTag && (
              <div className="max-w-2xl">
                <div className="mb-6">
                  <button
                    onClick={() => setViewMode("list")}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                  >
                    ← Back to Tags List
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900 mt-4">
                    View Tag
                  </h2>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tag Name
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-900 font-medium">
                        {selectedTag.name}
                      </div>
                      {selectedTag.readonly && (
                        <LockClosedIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <div className="text-gray-600 font-mono text-sm">
                      {selectedTag.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="text-gray-900">
                      {selectedTag.readonly ? "Readonly" : "Editable"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Synonyms ({selectedTag.synonyms.length})
                    </label>
                    {selectedTag.synonyms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedTag.synonyms.map((synonym, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {synonym}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No synonyms</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleCopy(selectedTag)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    Copy Tag
                  </button>

                  {!selectedTag.readonly && (
                    <button
                      onClick={() => setViewMode("edit")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Tag
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
