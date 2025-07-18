import { Profile } from "@/types";

// Preloaded Profiles
export const preloadedProfiles: Profile[] = [
  {
    id: "profile_default",
    name: "Default",
    categories: ["cat_general", "cat_development", "cat_social"],
    includeRecentCategory: true,
    numRecentToShow: 5,
    theme: "theme_default",
    readonly: true,
  },
  {
    id: "profile_work",
    name: "Work",
    categories: ["cat_development"],
    includeRecentCategory: true,
    numRecentToShow: 10,
    theme: "theme_minimal",
    readonly: true,
  },
  {
    id: "profile_personal",
    name: "Personal",
    categories: ["cat_social", "cat_general"],
    includeRecentCategory: true,
    numRecentToShow: 5,
    theme: "theme_colorful",
    readonly: true,
  },
];
