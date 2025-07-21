import React from "react";
import { Theme } from "@/types";

// Import Babel for JSX transformation
declare global {
  interface Window {
    Babel: any;
  }
}

// Dynamically import Babel standalone
const getBabel = async () => {
  if (typeof window !== "undefined") {
    if (!window.Babel) {
      try {
        const Babel = await import("@babel/standalone");
        window.Babel = Babel;
        console.log("Babel loaded successfully");
        return Babel;
      } catch (error) {
        console.error("Failed to load Babel:", error);
        throw new Error("Babel could not be loaded");
      }
    }
    return window.Babel;
  }
  throw new Error("Babel can only be used in browser environment");
};

// Theme storage interface for database serialization
export interface SerializedTheme {
  id: string;
  name: string;
  sourceCode: string;
  globals: Record<string, any>;
  readonly: boolean;
}

// Convert Theme to SerializedTheme for storage
export function serializeTheme(theme: Theme): SerializedTheme {
  return {
    id: theme.id,
    name: theme.name,
    sourceCode: theme.sourceCode,
    globals: theme.globals,
    readonly: theme.readonly,
  };
}

// Compile theme component source code with Babel
const compileComponent = async (
  sourceCode: string,
  themeData: any,
  globals: Record<string, any>
): Promise<React.ComponentType<any>> => {
  try {
    console.log("Starting theme compilation...");
    const babel = await getBabel();
    if (!babel) {
      throw new Error("Babel not available");
    }

    // Wrap the source code to create a proper module
    const wrappedCode = `
      (() => {
        const ThemeComponent = ${sourceCode};
        return ThemeComponent;
      })()
    `;

    console.log("Transforming code with Babel...");
    // Transform JSX/TypeScript to JavaScript
    const transformed = babel.transform(wrappedCode, {
      filename: "theme-component.tsx",
      presets: [
        ["env", { targets: { browsers: ["last 2 versions"] } }],
        "react",
        "typescript",
      ],
      plugins: ["proposal-class-properties", "proposal-object-rest-spread"],
    });

    const compiledCode = transformed.code;
    console.log("Code transformed successfully");

    // Create execution context with all necessary dependencies
    const TrackableLinkModule = await import(
      "@/components/shared/TrackableLink"
    );
    const SearchEngineBarModule = await import("@/components/SearchEngineBar");

    const context = {
      React,
      themeData,
      globals,
      TrackableLink: TrackableLinkModule.TrackableLink,
      SearchEngineBar: SearchEngineBarModule.default,
      console,
      // Add other common dependencies that themes might need
    };

    console.log("Creating component factory...");
    console.log("Compiled code:", compiledCode);

    // The compiled code is an IIFE that evaluates to the component
    // We need to create a function that returns the result of that IIFE
    const componentFactory = new Function(
      ...Object.keys(context),
      `
      "use strict";
      var result = ${compiledCode.replace(/^"use strict";\s*/, "")};
      return result;
      `
    );

    const component = componentFactory(...Object.values(context));
    console.log(
      "Component factory returned:",
      component,
      "Type:",
      typeof component
    );

    if (typeof component !== "function") {
      throw new Error("Theme compilation did not return a React component");
    }

    console.log("Theme compilation successful");
    return component;
  } catch (error) {
    console.error("Theme compilation error:", error);
    throw new Error(
      `Failed to compile theme: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Convert SerializedTheme to Theme with compiled component
export async function deserializeTheme(
  serialized: SerializedTheme
): Promise<Theme> {
  try {
    console.log(`Deserializing theme: ${serialized.name}`);
    const component = await compileComponent(
      serialized.sourceCode,
      {},
      serialized.globals
    );
    console.log(`Successfully compiled theme: ${serialized.name}`);

    return {
      id: serialized.id,
      name: serialized.name,
      component,
      sourceCode: serialized.sourceCode,
      globals: serialized.globals,
      readonly: serialized.readonly,
    };
  } catch (error) {
    console.error(`Failed to deserialize theme ${serialized.name}:`, error);

    // Return a fallback component
    const fallbackComponent = ({ data, Link }: any) =>
      React.createElement("div", {
        className: "p-8 text-center",
        children: `Error loading theme: ${serialized.name} - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });

    return {
      id: serialized.id,
      name: serialized.name,
      component: fallbackComponent,
      sourceCode: serialized.sourceCode,
      globals: serialized.globals,
      readonly: serialized.readonly,
    };
  }
}
