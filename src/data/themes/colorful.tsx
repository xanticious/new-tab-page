import React from "react";
import { ThemeData, TrackableLinkProps } from "@/types";

export const ColorfulTheme: React.FC<{
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, any>;
}> = ({ data, Link, globals }) => {
  const gradients = [
    "from-pink-500 to-violet-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-purple-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto pt-20">
        {!data.categories.length && (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📚</span>
              </div>
              <p className="text-gray-800 text-lg font-bold">
                No bookmarks found
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Adjust your filters to see your colorful collection!
              </p>
            </div>
          </div>
        )}

        {data.categories.length > 0 && (
          <div className="space-y-12">
            {data.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="category">
                <div className="flex items-center mb-8">
                  <div
                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${
                      gradients[categoryIndex % gradients.length]
                    } mr-4`}
                  ></div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {category.displayName}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {category.urls.map((urlItem, urlIndex) => (
                    <Link
                      key={urlItem.id}
                      urlId={urlItem.id}
                      url={urlItem.url}
                      className="group block relative"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          gradients[
                            (categoryIndex + urlIndex) % gradients.length
                          ]
                        } rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
                      ></div>
                      <div className="relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
                        <div className="flex flex-col items-center text-center space-y-4">
                          {urlItem.picture && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                              <img
                                src={urlItem.picture.base64ImageData}
                                alt={urlItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-gray-800 group-hover:text-gray-900 font-bold text-sm leading-tight">
                            {urlItem.name}
                          </span>
                        </div>
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
