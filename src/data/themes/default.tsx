import React from "react";
import { ThemeData, TrackableLinkProps } from "@/types";

export const DefaultTheme: React.FC<{
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, unknown>;
}> = ({ data, Link }) => {
  return (
    <div className="min-h-screen bg-blue-200">
      <div className="max-w-7xl mx-auto pt-20">
        {!data.categories.length && (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-blue-600 text-lg font-medium">
                No bookmarks found
              </p>
              <p className="text-blue-500 text-sm mt-1">
                Adjust your filters to see your saved links.
              </p>
            </div>
          </div>
        )}

        {data.categories.length > 0 && (
          <div className="space-y-10">
            {data.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="category">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.displayName}
                  </h2>
                  <div className="ml-4 flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {category.urls.map((urlItem) => (
                    <Link
                      key={urlItem.id}
                      urlId={urlItem.id}
                      url={urlItem.url}
                      className="group block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {urlItem.picture && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={urlItem.picture.base64ImageData}
                              alt={urlItem.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm leading-tight">
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
