import React from "react";
import Link from "next/link";
import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const SettingsPage = () => {
  const settingsLinks = [
    {
      title: "General Settings",
      description: "Configure general application settings and preferences",
      href: "/settings/general",
      icon: "⚙️",
    },
    {
      title: "Manage Profiles",
      description: "Create and manage user profiles",
      href: "/settings/profiles",
      icon: "👤",
    },
    {
      title: "Manage Categories",
      description: "Organize and manage bookmark categories",
      href: "/settings/categories",
      icon: "📁",
    },
    {
      title: "Manage URLs",
      description: "Add, edit, and organize your bookmarks",
      href: "/settings/urls",
      icon: "🔗",
    },
    {
      title: "Manage Tags",
      description: "Create and organize tags for better organization",
      href: "/settings/tags",
      icon: "🏷️",
    },
    {
      title: "Manage Pictures",
      description: "Upload and manage images for bookmarks",
      href: "/settings/pictures",
      icon: "🖼️",
    },
    {
      title: "Manage Themes",
      description: "Customize the appearance and themes",
      href: "/settings/themes",
      icon: "🎨",
    },
    {
      title: "Import / Export",
      description: "Import or export your settings and bookmarks",
      href: "/settings/import-export",
      icon: "📤",
    },
    {
      title: "Statistics",
      description: "View usage statistics and analytics",
      href: "/settings/statistics",
      icon: "📊",
    },
    {
      title: "Factory Reset",
      description: "Reset all settings to default values",
      href: "/settings/factory-reset",
      icon: "🔄",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your preferences and customize your new tab page experience
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsLinks.map((setting) => (
            <Link
              key={setting.href}
              href={setting.href}
              className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{setting.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {setting.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {setting.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                Configure
                <ChevronRightIcon className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeftIcon className="mr-2 w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
