import { Theme, ThemeComponent } from "@/types";
import { DefaultTheme } from "./default";
import { DarkTheme } from "./dark";
import { MinimalTheme } from "./minimal";
import { ColorfulTheme } from "./colorful";

// Component registry - maps component names to actual components
export const themeComponents: Record<string, ThemeComponent> = {
  DefaultTheme,
  DarkTheme,
  MinimalTheme,
  ColorfulTheme,
};

// Function to get a theme component by name
export function getThemeComponent(
  componentName: string
): ThemeComponent | null {
  return themeComponents[componentName] || null;
}

// Preloaded Themes
export const preloadedThemes: Theme[] = [
  {
    id: "theme_default",
    name: "Default Light",
    componentName: "DefaultTheme",
    readonly: true,
  },
  {
    id: "theme_dark",
    name: "Dark Mode",
    componentName: "DarkTheme",
    readonly: true,
  },
  {
    id: "theme_minimal",
    name: "Minimal",
    componentName: "MinimalTheme",
    readonly: true,
  },
  {
    id: "theme_colorful",
    name: "Colorful",
    componentName: "ColorfulTheme",
    readonly: true,
  },
];
