import { Theme } from "@/types";
import { DefaultTheme } from "./default";
import { DarkTheme } from "./dark";
import { MinimalTheme } from "./minimal";
import { ColorfulTheme } from "./colorful";

// Default theme source code template
export const DEFAULT_THEME_SOURCE_CODE = `({ data, Link, globals }) => {
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
}`;

// Dark theme source code
export const DARK_THEME_SOURCE_CODE = `({ data, Link, globals }) => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto pt-20">
        {!data.categories.length && (
          <div className="text-center py-16">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-gray-200 text-lg font-medium">
                No bookmarks found
              </p>
              <p className="text-gray-400 text-sm mt-1">
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
                  <h2 className="text-2xl font-bold text-gray-100">
                    {category.displayName}
                  </h2>
                  <div className="ml-4 flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {category.urls.map((urlItem) => (
                    <Link
                      key={urlItem.id}
                      urlId={urlItem.id}
                      url={urlItem.url}
                      className="group block bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 hover:shadow-xl hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {urlItem.picture && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                            <img
                              src={urlItem.picture.base64ImageData}
                              alt={urlItem.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-gray-200 group-hover:text-white font-medium text-sm leading-tight">
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
}`;

// Minimal theme source code
export const MINIMAL_THEME_SOURCE_CODE = `({ data, Link, globals }) => {
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
}`;

// Colorful theme source code
export const COLORFUL_THEME_SOURCE_CODE = `({ data, Link, globals }) => {
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
                    className={\`w-6 h-6 rounded-full bg-gradient-to-r \${
                      gradients[categoryIndex % gradients.length]
                    } mr-4\`}
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
                        className={\`absolute inset-0 bg-gradient-to-r \${
                          gradients[
                            (categoryIndex + urlIndex) % gradients.length
                          ]
                        } rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300\`}
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
}`;

// Preloaded Themes
export const preloadedThemes: Theme[] = [
  {
    id: "theme_default",
    name: "Default Light",
    component: DefaultTheme,
    sourceCode: DEFAULT_THEME_SOURCE_CODE,
    globals: {},
    readonly: true,
  },
  {
    id: "theme_dark",
    name: "Dark Mode",
    component: DarkTheme,
    sourceCode: DARK_THEME_SOURCE_CODE,
    globals: {},
    readonly: true,
  },
  {
    id: "theme_minimal",
    name: "Minimal",
    component: MinimalTheme,
    sourceCode: MINIMAL_THEME_SOURCE_CODE,
    globals: {},
    readonly: true,
  },
  {
    id: "theme_colorful",
    name: "Colorful",
    component: ColorfulTheme,
    sourceCode: COLORFUL_THEME_SOURCE_CODE,
    globals: {},
    readonly: true,
  },
];
