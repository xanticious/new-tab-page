// Import all preloaded data from separate files
import { preloadedPictures } from "./pictures";
import { preloadedTags } from "./tags";
import { preloadedUrls } from "./urls";
import { preloadedThemes } from "./themes";
import { preloadedCategories } from "./categories";
import { preloadedProfiles } from "./profiles";

// Re-export all preloaded data for backward compatibility
export { preloadedPictures } from "./pictures";
export { preloadedTags } from "./tags";
export { preloadedUrls } from "./urls";
export { preloadedThemes } from "./themes";
export { preloadedCategories } from "./categories";
export { preloadedProfiles } from "./profiles";

// Combined preloaded data
export const preloadedData = {
  pictures: preloadedPictures,
  tags: preloadedTags,
  urls: preloadedUrls,
  themes: preloadedThemes,
  categories: preloadedCategories,
  profiles: preloadedProfiles,
} as const;
