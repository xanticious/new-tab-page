import { useMemo } from "react";
import { useThemes } from "./useDatabase";
import { getThemeComponent } from "@/data/themes";
import { ThemeComponent, Theme, ID } from "@/types";

// Hook for working with theme components
export function useThemeComponents() {
  const {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh,
  } = useThemes();

  // Get a theme component by theme ID
  const getThemeComponentById = useMemo(() => {
    return (themeId: ID): ThemeComponent | null => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return null;
      return getThemeComponent(theme.componentName);
    };
  }, [themes]);

  // Get a theme by ID
  const getThemeById = useMemo(() => {
    return (themeId: ID): Theme | null => {
      return themes.find((t) => t.id === themeId) || null;
    };
  }, [themes]);

  // Get all available theme component names
  const availableComponentNames = useMemo(() => {
    const names = new Set<string>();
    themes.forEach((theme) => {
      names.add(theme.componentName);
    });
    return Array.from(names);
  }, [themes]);

  return {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh,
    getThemeComponentById,
    getThemeById,
    availableComponentNames,
  };
}
