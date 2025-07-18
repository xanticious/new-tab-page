import { Category } from "@/types";

// Preloaded Categories
export const preloadedCategories: Category[] = [
  {
    id: "cat_development",
    name: "Development Tools",
    urls: ["url_github", "url_stackoverflow"],
    readonly: true,
  },
  {
    id: "cat_social",
    name: "Social & News",
    urls: ["url_twitter", "url_reddit"],
    readonly: true,
  },
  {
    id: "cat_general",
    name: "General",
    urls: ["url_google", "url_youtube"],
    readonly: true,
  },
];
