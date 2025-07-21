"use client";

import React, { useState, useEffect } from "react";
import { Theme, CreateTheme, UpdateTheme, ThemeData } from "@/types";
import { useThemes } from "@/hooks/useDatabase";
import { BackToSettingsLink } from "@/components/BackToSettingsLink";
import { DEFAULT_THEME_SOURCE_CODE } from "@/data/themes";
import { deserializeTheme, serializeTheme } from "@/lib/themeSerializer";

interface ThemeFormData {
  name: string;
  sourceCode: string;
}

type ViewMode = "list" | "create" | "edit" | "view";

// Sample theme data for preview
const SAMPLE_THEME_DATA: ThemeData = {
  categories: [
    {
      displayName: "Development",
      urls: [
        {
          id: "sample_1",
          name: "GitHub",
          url: "https://github.com",
          picture: {
            base64ImageData:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDg0IDIgMTIuMDE3QzIgMTYuNjI0IDUuMjQzIDIwLjEwNyA5LjU4NyAyMC45ODVDOS45MzcgMjEuMTQ4IDEwLjEyMyAyMC44NiAxMC4xMjMgMjAuNjExQzEwLjEyMyAyMC4zNDQgMTAuMTI3IDIwLjI3IDEwLjEyNyAyMC4xQzEwLjEyNyAxOS4wMjcgMTAuNzI3IDE3LjczIDEwLjcyNyAxNy43M0MxMS4xODMgMTcuODM1IDExLjUyOCAxNy4zIDExLjUyOCAxNi45ODRDMTEuNTI4IDE2LjcxMyAxMS40MTggMTYuNDMgMTEuMzQ1IDE2LjEzOEMxMS4zNDUgMTYuMTM4IDEyLjcwOSAxNi44IDE0IDE2LjhDMTYgMTYuOCAxNyAxNi4wMzcgMTcgMTRDMTcgMTMuMzk3IDE2LjMxIDEzLjQ1IDE2LjMxIDEzLjQ1QzE3IDE0IDE3IDEzLjM5NyAxNyAxNEMxNyAyMi4xIDEyIDIyIDEyIDIySDlDNSA0IDIgNyAyIDEyQzIgMTguNjI3IDYuMzczIDI0IDEzIDI0UzI0IDE4LjYyNyAyNCAxMkMyNCA2LjM3MyAxOS42MjcgMSAxMyAxWiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4K",
          },
        },
        {
          id: "sample_2",
          name: "Stack Overflow",
          url: "https://stackoverflow.com",
        },
      ],
    },
    {
      displayName: "Social",
      urls: [
        {
          id: "sample_3",
          name: "Twitter",
          url: "https://twitter.com",
        },
      ],
    },
  ],
};

// Mock TrackableLink component for preview
const MockLink: React.FC<any> = ({ children, className, url }) => (
  <a href={url} className={className} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);

export default function ThemesManagementPage() {
  const {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh,
  } = useThemes();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<ThemeFormData>({
    name: "",
    sourceCode: DEFAULT_THEME_SOURCE_CODE,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compiledPreviewComponent, setCompiledPreviewComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [isCompilingPreview, setIsCompilingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Manual preview refresh function
  const refreshPreview = async () => {
    if (!formData.sourceCode.trim()) {
      setCompiledPreviewComponent(null);
      setPreviewError(null);
      return;
    }

    setIsCompilingPreview(true);
    setPreviewError(null);

    try {
      const component = await compileThemeComponent(formData.sourceCode);
      setCompiledPreviewComponent(() => component);
    } catch (error) {
      setPreviewError(`Preview Error: ${(error as Error).message}`);
      setCompiledPreviewComponent(null);
    } finally {
      setIsCompilingPreview(false);
    }
  };

  // Filter themes based on search term
  const filteredThemes = themes.filter((theme) =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      setFormData({
        name: "",
        sourceCode: DEFAULT_THEME_SOURCE_CODE,
      });
      setSelectedTheme(null);
    } else if (viewMode === "edit" && selectedTheme) {
      setFormData({
        name: selectedTheme.name,
        sourceCode: selectedTheme.sourceCode,
      });
    }
    setFormErrors({});
    setPreviewError(null);
    setCompiledPreviewComponent(null); // Clear preview when switching modes
  }, [viewMode, selectedTheme]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Theme name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Theme name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current theme when editing)
      const existingTheme = themes.find(
        (theme) =>
          theme.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || theme.id !== selectedTheme?.id)
      );
      if (existingTheme) {
        errors.name = "A theme with this name already exists";
      }
    }

    if (!formData.sourceCode.trim()) {
      errors.sourceCode = "Theme source code is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const compileThemeComponent = async (sourceCode: string) => {
    try {
      // Use the same serialization/deserialization logic as the database
      const serializedTheme = {
        id: "preview",
        name: "Preview",
        sourceCode,
        globals: {},
        readonly: false,
      };

      const theme = await deserializeTheme(serializedTheme);
      return theme.component;
    } catch (error) {
      console.error("Failed to compile theme component:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Compile the component to validate it
      const compiledComponent = await compileThemeComponent(
        formData.sourceCode
      );

      const themeData = {
        name: formData.name.trim(),
        component: compiledComponent,
        sourceCode: formData.sourceCode,
        globals: {},
      };

      if (viewMode === "create") {
        await createTheme(themeData as CreateTheme);
      } else if (viewMode === "edit" && selectedTheme) {
        await updateTheme({
          id: selectedTheme.id,
          ...themeData,
        } as UpdateTheme);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save theme:", err);
      setFormErrors({
        sourceCode: "Invalid theme code. Please check your syntax.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (theme: Theme) => {
    if (theme.readonly) return;

    if (confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) {
      try {
        await deleteTheme(theme.id);
      } catch (err) {
        console.error("Failed to delete theme:", err);
      }
    }
  };

  const renderPreview = () => {
    if (!formData.sourceCode.trim()) {
      return (
        <div
          className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
          style={{ height: "400px" }}
        >
          <p className="text-gray-500">No code to preview</p>
        </div>
      );
    }

    if (isCompilingPreview) {
      return (
        <div
          className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
          style={{ height: "400px" }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (previewError) {
      return (
        <div
          className="border rounded-lg p-4 bg-red-50 border-red-200"
          style={{ height: "400px" }}
        >
          <p className="text-red-600 text-sm">{previewError}</p>
        </div>
      );
    }

    if (compiledPreviewComponent) {
      const CompiledTheme = compiledPreviewComponent;
      return (
        <div
          className="border rounded-lg overflow-hidden bg-white"
          style={{ height: "400px" }}
        >
          <div className="h-full overflow-auto">
            <CompiledTheme
              data={SAMPLE_THEME_DATA}
              Link={MockLink}
              globals={{}}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
        style={{ height: "400px" }}
      >
        <p className="text-gray-500">
          Click "Refresh Preview" to see your theme
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <h2 className="text-red-800 font-medium">Error Loading Themes</h2>
            <p className="text-red-600 mt-1">{error}</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Themes
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and customize themes for your new tab page
                </p>
              </div>
              {viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Theme
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === "list" && (
              <>
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search themes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Themes List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {theme.name}
                          </h3>
                          {theme.readonly && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                              Read-only
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTheme(theme);
                            setViewMode("view");
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>
                        {!theme.readonly && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTheme(theme);
                                setViewMode("edit");
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(theme)}
                              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredThemes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No themes found.</p>
                  </div>
                )}
              </>
            )}

            {(viewMode === "create" || viewMode === "edit") && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {viewMode === "create" ? "Create Theme" : "Edit Theme"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Back to List
                      </button>
                    </div>

                    {/* Theme Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter theme name"
                      />
                      {formErrors.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Source Code Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Source Code
                      </label>
                      <textarea
                        value={formData.sourceCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sourceCode: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                          formErrors.sourceCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        rows={20}
                        placeholder="Enter your theme component code..."
                      />
                      {formErrors.sourceCode && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.sourceCode}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        Write a React component function that receives{" "}
                        {`{ data, Link, globals }`} props.
                      </p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : viewMode === "create"
                          ? "Create Theme"
                          : "Update Theme"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Live Preview</h3>
                      <button
                        type="button"
                        onClick={refreshPreview}
                        disabled={
                          isCompilingPreview || !formData.sourceCode.trim()
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {isCompilingPreview ? "Loading..." : "Refresh Preview"}
                      </button>
                    </div>
                    {renderPreview()}
                  </div>
                </div>
              </form>
            )}

            {viewMode === "view" && selectedTheme && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    View Theme: {selectedTheme.name}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back to List
                    </button>
                    {!selectedTheme.readonly && (
                      <button
                        onClick={() => setViewMode("edit")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Theme Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Theme Name
                      </h3>
                      <p className="text-gray-700">{selectedTheme.name}</p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Source Code
                      </h3>
                      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-96 border">
                        <code>{selectedTheme.sourceCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Preview</h3>
                    <div
                      className="border rounded-lg overflow-hidden bg-white"
                      style={{ height: "400px" }}
                    >
                      <div className="h-full overflow-auto">
                        <selectedTheme.component
                          data={SAMPLE_THEME_DATA}
                          Link={MockLink}
                          globals={{}}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
