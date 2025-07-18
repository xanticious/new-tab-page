"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  usePictures,
  useTags,
  useUrls,
  useThemes,
  useCategories,
  useProfiles,
  useUrlClickEvents,
} from "@/hooks/useDatabase";

export function DatabaseDemo() {
  const [activeTab, setActiveTab] = useState<
    | "pictures"
    | "tags"
    | "urls"
    | "themes"
    | "categories"
    | "profiles"
    | "clickEvents"
  >("urls");

  const { pictures, createPicture, deletePicture } = usePictures();
  const { tags, createTag, deleteTag } = useTags();
  const { urls, createUrl, deleteUrl } = useUrls();
  const { themes, createTheme, deleteTheme } = useThemes();
  const { categories, createCategory, deleteCategory } = useCategories();
  const { profiles, createProfile, deleteProfile } = useProfiles();
  const { clickEvents, addClickEvent, clearAllClickEvents } =
    useUrlClickEvents();

  const tabs = [
    { id: "urls" as const, label: "URLs", data: urls },
    { id: "tags" as const, label: "Tags", data: tags },
    { id: "categories" as const, label: "Categories", data: categories },
    { id: "profiles" as const, label: "Profiles", data: profiles },
    { id: "themes" as const, label: "Themes", data: themes },
    { id: "pictures" as const, label: "Pictures", data: pictures },
    { id: "clickEvents" as const, label: "Click Events", data: clickEvents },
  ];

  const handleCreateSample = async () => {
    try {
      switch (activeTab) {
        case "urls":
          await createUrl({
            name: "Example Site",
            url: "https://example.com",
            tags: [],
          });
          break;
        case "tags":
          await createTag({
            name: "Custom Tag",
            synonyms: ["custom", "user-created"],
          });
          break;
        case "categories":
          await createCategory({
            name: "Custom Category",
            urls: [],
          });
          break;
        case "profiles":
          await createProfile({
            name: "Custom Profile",
            categories: [],
            includeRecentCategory: true,
            numRecentToShow: 5,
            theme: "theme_default",
          });
          break;
        case "themes":
          await createTheme({
            name: "Custom Theme",
            componentName: "DefaultTheme", // Use existing component for user-created themes
          });
          break;
        case "pictures":
          await createPicture({
            name: "Custom Picture",
            base64ImageData:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          });
          break;
        case "clickEvents":
          // Add a click event for the first URL if available
          if (urls.length > 0) {
            await addClickEvent(urls[0].id);
          } else {
            alert(
              "No URLs available to track clicks for. Please create a URL first."
            );
          }
          break;
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      switch (activeTab) {
        case "urls":
          await deleteUrl(id);
          break;
        case "tags":
          await deleteTag(id);
          break;
        case "categories":
          await deleteCategory(id);
          break;
        case "profiles":
          await deleteProfile(id);
          break;
        case "themes":
          await deleteTheme(id);
          break;
        case "pictures":
          await deletePicture(id);
          break;
        case "clickEvents":
          // For click events, we'll provide a clear all option instead of individual deletion
          await clearAllClickEvents();
          break;
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert(
        `Failed to delete: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const activeData = tabs.find((tab) => tab.id === activeTab)?.data || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Demo</h1>
        <p className="text-gray-600">
          This demo shows the preloaded data and allows you to test CRUD
          operations. Readonly items (preloaded) cannot be deleted or modified.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label} ({tab.data.length})
            </button>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={handleCreateSample}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {activeTab === "clickEvents"
            ? "Add Click Event"
            : `Create Sample ${
                activeTab.slice(0, -1).charAt(0).toUpperCase() +
                activeTab.slice(1, -1)
              }`}
        </button>
      </div>

      {/* Data Display */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {activeData.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No {activeTab} found
            </div>
          ) : (
            activeData.map((item: any) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    {item.readonly && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Readonly
                      </span>
                    )}
                  </div>

                  {/* Show additional info based on type */}
                  {activeTab === "urls" && (
                    <p className="text-sm text-gray-500 mt-1">
                      {(item as any).url}
                    </p>
                  )}
                  {activeTab === "tags" && item.synonyms.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Synonyms: {item.synonyms.join(", ")}
                    </p>
                  )}
                  {activeTab === "categories" && (
                    <p className="text-sm text-gray-500 mt-1">
                      URLs: {item.urls.length}
                    </p>
                  )}
                  {activeTab === "profiles" && (
                    <p className="text-sm text-gray-500 mt-1">
                      Categories: {item.categories.length}, Theme: {item.theme}
                    </p>
                  )}
                  {activeTab === "themes" && (
                    <p className="text-sm text-gray-500 mt-1">
                      Component: {item.componentName}
                    </p>
                  )}
                  {activeTab === "pictures" && (
                    <div className="mt-2">
                      <img
                        src={item.base64ImageData}
                        alt={item.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    </div>
                  )}
                  {activeTab === "clickEvents" && (
                    <div className="text-sm text-gray-500 mt-1">
                      <p>URL: {item.urlId}</p>
                      <p>Time: {new Date(item.timestamp).toLocaleString()}</p>
                      <p>
                        Hour: {item.hour}, Weekday: {item.weekday}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {item.id}
                  </span>
                  {activeTab === "clickEvents" ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Clear All
                    </button>
                  ) : (
                    !item.readonly && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          {tabs.map((tab) => {
            // Special handling for click events which don't have readonly property
            if (tab.id === "clickEvents") {
              return (
                <div key={tab.id} className="text-center">
                  <div className="font-medium text-gray-900">{tab.label}</div>
                  <div className="text-gray-600">
                    {tab.data.length} total events
                  </div>
                </div>
              );
            }

            const readonly = tab.data.filter(
              (item: any) => item.readonly
            ).length;
            const userCreated = tab.data.length - readonly;
            return (
              <div key={tab.id} className="text-center">
                <div className="font-medium text-gray-900">{tab.label}</div>
                <div className="text-gray-600">
                  {readonly} preloaded, {userCreated} custom
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
