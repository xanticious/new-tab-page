import { useMemo } from "react";
import { useThemes } from "./useDatabase";
import {
  ThemeComponent,
  Theme,
  ID,
  TrackableLinkProps,
  ThemeData,
} from "@/types";
import { TrackableLink } from "@/components/shared/TrackableLink";
import React from "react";

// Declare the global themeGlobals object
declare global {
  interface Window {
    themeGlobals: Record<string, Record<string, unknown>>;
  }
}

// Initialize the global theme globals object
if (typeof window !== "undefined" && !window.themeGlobals) {
  window.themeGlobals = {};
}

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
      return theme.component;
    };
  }, [themes]);

  // Get a theme component with Link and globals pre-configured
  const getThemeComponentWithProps = useMemo(() => {
    return (
      themeId: ID,
      LinkComponent: React.ComponentType<TrackableLinkProps> = TrackableLink
    ): React.ComponentType<{ data: ThemeData }> | null => {
      const theme = themes.find((t) => t.id === themeId);
      if (!theme) return null;

      // Initialize globals for this theme if not exists
      if (typeof window !== "undefined" && !window.themeGlobals[theme.name]) {
        window.themeGlobals[theme.name] = { ...theme.globals };
      }

      // Return a wrapped component that includes all required props
      const WrappedComponent = ({ data }: { data: ThemeData }) =>
        React.createElement(theme.component, {
          data,
          Link: LinkComponent,
          globals:
            typeof window !== "undefined"
              ? window.themeGlobals[theme.name]
              : {},
        });

      WrappedComponent.displayName = `ThemeWrapper(${theme.name})`;
      return WrappedComponent;
    };
  }, [themes]);

  // Get a theme by ID
  const getThemeById = useMemo(() => {
    return (themeId: ID): Theme | null => {
      return themes.find((t) => t.id === themeId) || null;
    };
  }, [themes]);

  // Compile source code to a React component
  const compileThemeComponent = useMemo(() => {
    return (sourceCode: string, themeName: string): ThemeComponent | null => {
      try {
        // Create a function that returns a React component
        // This is a simplified version - in production you might want to use a more robust compiler
        const componentFunction = new Function(
          "React",
          "props",
          `return (${sourceCode})(props);`
        );

        return (props) => componentFunction(React, props);
      } catch (error) {
        console.error(
          `Failed to compile theme component for ${themeName}:`,
          error
        );
        return null;
      }
    };
  }, []);

  return {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh,
    getThemeComponentById,
    getThemeComponentWithProps,
    getThemeById,
    compileThemeComponent,
  };
}
