import React from "react";
import { ThemeData, TrackableLinkProps } from "@/types";

export const MinimalTheme: React.FC<{
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, unknown>;
}> = ({ data, Link }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto pt-20">
        {!data.categories.length && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No bookmarks found. Adjust your filters.
            </p>
          </div>
        )}

        {data.categories.length > 0 && (
          <div className="space-y-8">
            {data.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="category">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  {category.displayName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.urls.map((urlItem) => (
                    <Link
                      key={urlItem.id}
                      urlId={urlItem.id}
                      url={urlItem.url}
                      className="group block p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {urlItem.picture && (
                          <img
                            src={urlItem.picture.base64ImageData}
                            alt={urlItem.name}
                            className="w-8 h-8 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium truncate">
                          {urlItem.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
