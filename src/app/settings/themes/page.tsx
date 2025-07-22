"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Theme,
  CreateTheme,
  UpdateTheme,
  ThemeData,
  ThemeComponent,
  TrackableLinkProps,
} from "@/types";
import { useThemes } from "@/hooks/useDatabase";
import { BackToSettingsLink } from "@/components/BackToSettingsLink";
import { DEFAULT_THEME_SOURCE_CODE } from "@/data/themes";
import { deserializeTheme, serializeTheme } from "@/lib/themeSerializer";

// Monaco Editor configuration function
const configureMonacoEditor = (monaco: any) => {
  // Define TypeScript interfaces for intellisense
  const typeDefs = `
declare module "react" {
  interface ComponentType<P = {}> {
    (props: P & { children?: React.ReactNode }): React.ReactElement<any, any> | null;
  }
  
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: string | number | null;
  }
  
  interface ReactNode {
    // This allows anything that can be rendered
  }
  
  interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null;
  }
  
  function createElement<P extends {}>(
    type: string | ComponentType<P>,
    props?: P | null,
    ...children: ReactNode[]
  ): ReactElement<P>;
}

declare namespace React {
  const createElement: typeof import("react").createElement;
  type ComponentType<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null;
  type ReactElement<P = any, T = any> = import("react").ReactElement<P, T>;
  type ReactNode = import("react").ReactNode;
}

declare namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {}
  interface ElementAttributesProperty { props: {}; }
  interface ElementChildrenAttribute { children: {}; }
  interface IntrinsicAttributes { key?: string | number; }
  interface IntrinsicClassAttributes<T> { ref?: React.Ref<T>; }
  
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}

interface ThemeData {
  categories: Array<{
    displayName: string;
    urls: Array<{
      id: string;
      name: string;
      url: string;
      picture?: {
        base64ImageData: string;
      };
    }>;
  }>;
}

interface TrackableLinkProps {
  urlId: string;
  url: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface ThemeComponent extends React.ComponentType<{
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, any>;
}> {}

declare const React: typeof import("react");

// Common theme component export pattern
declare function ThemeComponent(props: {
  data: ThemeData;
  Link: React.ComponentType<TrackableLinkProps>;
  globals: Record<string, any>;
}): JSX.Element;

export default ThemeComponent;
`;

  // Add type definitions to the TypeScript language service
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    typeDefs,
    "file:///theme-types.d.ts"
  );

  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
    allowSyntheticDefaultImports: true,
    strict: false,
    skipLibCheck: true,
  });

  // Extended TailwindCSS class suggestions
  const tailwindClasses = [
    // Layout
    "flex",
    "grid",
    "block",
    "inline",
    "inline-block",
    "hidden",
    "table",
    "flex-col",
    "flex-row",
    "flex-wrap",
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "items-center",
    "items-start",
    "items-end",
    "justify-center",
    "justify-start",
    "justify-end",
    "justify-between",

    // Sizing
    "w-full",
    "w-1/2",
    "w-1/3",
    "w-1/4",
    "w-auto",
    "w-screen",
    "w-fit",
    "h-full",
    "h-screen",
    "h-auto",
    "h-fit",
    "h-96",
    "h-64",
    "h-32",
    "h-16",
    "h-8",
    "h-4",
    "max-w-sm",
    "max-w-md",
    "max-w-lg",
    "max-w-xl",
    "max-w-2xl",
    "max-w-4xl",
    "max-w-6xl",

    // Spacing
    "p-0",
    "p-1",
    "p-2",
    "p-3",
    "p-4",
    "p-6",
    "p-8",
    "p-12",
    "px-1",
    "px-2",
    "px-3",
    "px-4",
    "px-6",
    "px-8",
    "py-1",
    "py-2",
    "py-3",
    "py-4",
    "py-6",
    "py-8",
    "m-0",
    "m-1",
    "m-2",
    "m-3",
    "m-4",
    "m-6",
    "m-8",
    "m-auto",
    "mx-auto",
    "my-auto",
    "mx-1",
    "mx-2",
    "mx-4",
    "my-1",
    "my-2",
    "my-4",
    "space-x-1",
    "space-x-2",
    "space-x-4",
    "space-y-1",
    "space-y-2",
    "space-y-4",
    "gap-1",
    "gap-2",
    "gap-4",
    "gap-6",
    "gap-8",

    // Typography
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "font-thin",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-black",
    "text-left",
    "text-center",
    "text-right",
    "text-justify",
    "leading-none",
    "leading-tight",
    "leading-normal",
    "leading-relaxed",
    "tracking-tighter",
    "tracking-tight",
    "tracking-normal",
    "tracking-wide",

    // Colors
    "text-white",
    "text-black",
    "text-transparent",
    "text-gray-50",
    "text-gray-100",
    "text-gray-200",
    "text-gray-300",
    "text-gray-400",
    "text-gray-500",
    "text-gray-600",
    "text-gray-700",
    "text-gray-800",
    "text-gray-900",
    "text-blue-50",
    "text-blue-100",
    "text-blue-500",
    "text-blue-600",
    "text-blue-700",
    "text-blue-800",
    "text-blue-900",
    "text-red-50",
    "text-red-100",
    "text-red-500",
    "text-red-600",
    "text-red-700",
    "text-green-50",
    "text-green-100",
    "text-green-500",
    "text-green-600",
    "text-green-700",
    "text-yellow-50",
    "text-yellow-100",
    "text-yellow-500",
    "text-yellow-600",
    "text-yellow-700",

    "bg-white",
    "bg-black",
    "bg-transparent",
    "bg-gray-50",
    "bg-gray-100",
    "bg-gray-200",
    "bg-gray-300",
    "bg-gray-400",
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-gray-800",
    "bg-gray-900",
    "bg-blue-50",
    "bg-blue-100",
    "bg-blue-500",
    "bg-blue-600",
    "bg-blue-700",
    "bg-blue-800",
    "bg-blue-900",
    "bg-red-50",
    "bg-red-100",
    "bg-red-500",
    "bg-red-600",
    "bg-red-700",
    "bg-green-50",
    "bg-green-100",
    "bg-green-500",
    "bg-green-600",
    "bg-green-700",

    // Borders
    "border",
    "border-0",
    "border-2",
    "border-4",
    "border-8",
    "border-gray-100",
    "border-gray-200",
    "border-gray-300",
    "border-gray-400",
    "border-gray-500",
    "border-blue-200",
    "border-blue-300",
    "border-blue-400",
    "border-blue-500",
    "rounded",
    "rounded-sm",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
    "rounded-full",
    "rounded-t",
    "rounded-r",
    "rounded-b",
    "rounded-l",

    // Effects
    "shadow",
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "opacity-0",
    "opacity-25",
    "opacity-50",
    "opacity-75",
    "opacity-100",

    // Transitions & Interactions
    "transition",
    "transition-all",
    "transition-colors",
    "transition-opacity",
    "transition-transform",
    "duration-75",
    "duration-100",
    "duration-150",
    "duration-200",
    "duration-300",
    "duration-500",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "hover:bg-gray-50",
    "hover:bg-gray-100",
    "hover:bg-blue-50",
    "hover:bg-blue-100",
    "hover:text-blue-600",
    "hover:text-blue-700",
    "hover:text-gray-700",
    "hover:text-gray-800",
    "hover:shadow-md",
    "hover:shadow-lg",
    "hover:scale-105",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-blue-500",
    "focus:ring-opacity-50",
    "active:bg-gray-100",
    "active:scale-95",

    // Cursor
    "cursor-pointer",
    "cursor-default",
    "cursor-not-allowed",

    // Overflow
    "overflow-hidden",
    "overflow-auto",
    "overflow-scroll",
    "overflow-x-auto",
    "overflow-y-auto",

    // Position
    "relative",
    "absolute",
    "fixed",
    "sticky",
    "top-0",
    "right-0",
    "bottom-0",
    "left-0",
    "inset-0",
    "z-10",
    "z-20",
    "z-30",
    "z-40",
    "z-50",
  ];

  // Register CSS class completion provider for className attributes
  monaco.languages.registerCompletionItemProvider("typescript", {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Check if we're inside a className prop
      if (
        textBeforeCursor.includes('className="') ||
        textBeforeCursor.includes("className='")
      ) {
        return {
          suggestions: tailwindClasses.map((className) => ({
            label: className,
            kind: monaco.languages.CompletionItemKind.Constant,
            insertText: className,
            range: range,
            documentation: `TailwindCSS class: ${className}`,
          })),
        };
      }

      return { suggestions: [] };
    },
  });

  // Add helpful code snippets for theme development
  monaco.languages.registerCompletionItemProvider("typescript", {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        {
          label: "theme-basic",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "({ data, Link, globals }) => {",
            "  return (",
            '    <div className="min-h-screen bg-gray-50 p-6">',
            '      <div className="max-w-6xl mx-auto">',
            '        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookmarks</h1>',
            "        {data.categories.map((category) => (",
            '          <div key={category.displayName} className="mb-8">',
            '            <h2 className="text-xl font-semibold text-gray-700 mb-4">',
            "              {category.displayName}",
            "            </h2>",
            '            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">',
            "              {category.urls.map((url) => (",
            "                <Link",
            "                  key={url.id}",
            "                  urlId={url.id}",
            "                  url={url.url}",
            '                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"',
            "                >",
            '                  <div className="flex items-center space-x-3">',
            "                    {url.picture && (",
            "                      <img",
            "                        src={url.picture.base64ImageData}",
            '                        alt=""',
            '                        className="w-6 h-6 rounded"',
            "                      />",
            "                    )}",
            '                    <span className="text-gray-900 font-medium">{url.name}</span>',
            "                  </div>",
            "                </Link>",
            "              ))}",
            "            </div>",
            "          </div>",
            "        ))}",
            "      </div>",
            "    </div>",
            "  );",
            "}",
          ].join("\n"),
          range: range,
          documentation: "Basic theme template with categories and grid layout",
        },
        {
          label: "theme-card",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "<Link",
            "  key={url.id}",
            "  urlId={url.id}",
            "  url={url.url}",
            '  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"',
            ">",
            '  <div className="flex items-center space-x-3">',
            "    {url.picture && (",
            "      <img",
            "        src={url.picture.base64ImageData}",
            '        alt=""',
            '        className="w-8 h-8 rounded-md"',
            "      />",
            "    )}",
            "    <div>",
            '      <h3 className="font-medium text-gray-900">{url.name}</h3>',
            '      <p className="text-sm text-gray-500">{url.url}</p>',
            "    </div>",
            "  </div>",
            "</Link>",
          ].join("\n"),
          range: range,
          documentation: "Card component for displaying a bookmark",
        },
        {
          label: "theme-grid",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">',
            "  {category.urls.map((url) => (",
            "    <Link key={url.id} urlId={url.id} url={url.url}>",
            "      {/* Card content */}",
            "    </Link>",
            "  ))}",
            "</div>",
          ].join("\n"),
          range: range,
          documentation: "Responsive grid layout for bookmarks",
        },
      ];

      return { suggestions };
    },
  });
};

interface ThemeFormData {
  name: string;
  sourceCode: string;
}

type ViewMode = "list" | "create" | "edit" | "view";

// Sample theme data for preview
const SAMPLE_THEME_DATA: ThemeData = {
  categories: [
    {
      displayName: "Development",
      urls: [
        {
          id: "sample_1",
          name: "GitHub",
          url: "https://github.com",
          picture: {
            base64ImageData:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDg0IDIgMTIuMDE3QzIgMTYuNjI0IDUuMjQzIDIwLjEwNyA5LjU4NyAyMC45ODVDOS45MzcgMjEuMTQ4IDEwLjEyMyAyMC44NiAxMC4xMjMgMjAuNjExQzEwLjEyMyAyMC4zNDQgMTAuMTI3IDIwLjI3IDEwLjEyNyAyMC4xQzEwLjEyNyAxOS4wMjcgMTAuNzI3IDE3LjczIDEwLjcyNyAxNy43M0MxMS4xODMgMTcuODM1IDExLjUyOCAxNy4zIDExLjUyOCAxNi45ODRDMTEuNTI4IDE2LjcxMyAxMS40MTggMTYuNDMgMTEuMzQ1IDE2LjEzOEMxMS4zNDUgMTYuMTM4IDEyLjcwOSAxNi44IDE0IDE2LjhDMTYgMTYuOCAxNyAxNi4wMzcgMTcgMTRDMTcgMTMuMzk3IDE2LjMxIDEzLjQ1IDE2LjMxIDEzLjQ1QzE3IDE0IDE3IDEzLjM5NyAxNyAxNEMxNyAyMi4xIDEyIDIyIDEyIDIySDlDNSA0IDIgNyAyIDEyQzIgMTguNjI3IDYuMzczIDI0IDEzIDI0UzI0IDE4LjYyNyAyNCAxMkMyNCA2LjM3MyAxOS42MjcgMSAxMyAxWiIgZmlsbD0iIzMzMzMzMyIvPgo8L3N2Zz4K",
          },
        },
        {
          id: "sample_2",
          name: "Stack Overflow",
          url: "https://stackoverflow.com",
        },
      ],
    },
    {
      displayName: "Social",
      urls: [
        {
          id: "sample_3",
          name: "Twitter",
          url: "https://twitter.com",
        },
      ],
    },
  ],
};

// Mock TrackableLink component for preview
const MockLink: React.FC<any> = ({ children, className, url }) => (
  <a href={url} className={className} onClick={(e) => e.preventDefault()}>
    {children}
  </a>
);

export default function ThemesManagementPage() {
  const {
    themes,
    isLoading,
    error,
    createTheme,
    updateTheme,
    deleteTheme,
    refresh,
  } = useThemes();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<ThemeFormData>({
    name: "",
    sourceCode: DEFAULT_THEME_SOURCE_CODE,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compiledPreviewComponent, setCompiledPreviewComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [isCompilingPreview, setIsCompilingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Manual preview refresh function
  const refreshPreview = async () => {
    if (!formData.sourceCode.trim()) {
      setCompiledPreviewComponent(null);
      setPreviewError(null);
      return;
    }

    setIsCompilingPreview(true);
    setPreviewError(null);

    try {
      const component = await compileThemeComponent(formData.sourceCode);
      setCompiledPreviewComponent(() => component);
    } catch (error) {
      setPreviewError(`Preview Error: ${(error as Error).message}`);
      setCompiledPreviewComponent(null);
    } finally {
      setIsCompilingPreview(false);
    }
  };

  // Filter themes based on search term
  const filteredThemes = themes.filter((theme) =>
    theme.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when view mode changes
  useEffect(() => {
    if (viewMode === "create") {
      setFormData({
        name: "",
        sourceCode: DEFAULT_THEME_SOURCE_CODE,
      });
      setSelectedTheme(null);
    } else if (viewMode === "edit" && selectedTheme) {
      setFormData({
        name: selectedTheme.name,
        sourceCode: selectedTheme.sourceCode,
      });
    }
    setFormErrors({});
    setPreviewError(null);
    setCompiledPreviewComponent(null); // Clear preview when switching modes
  }, [viewMode, selectedTheme]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Theme name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Theme name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current theme when editing)
      const existingTheme = themes.find(
        (theme) =>
          theme.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          (viewMode === "create" || theme.id !== selectedTheme?.id)
      );
      if (existingTheme) {
        errors.name = "A theme with this name already exists";
      }
    }

    if (!formData.sourceCode.trim()) {
      errors.sourceCode = "Theme source code is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const compileThemeComponent = async (sourceCode: string) => {
    try {
      // Use the same serialization/deserialization logic as the database
      const serializedTheme = {
        id: "preview",
        name: "Preview",
        sourceCode,
        globals: {},
        readonly: false,
      };

      const theme = await deserializeTheme(serializedTheme);
      return theme.component;
    } catch (error) {
      console.error("Failed to compile theme component:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Compile the component to validate it
      const compiledComponent = await compileThemeComponent(
        formData.sourceCode
      );

      const themeData = {
        name: formData.name.trim(),
        component: compiledComponent,
        sourceCode: formData.sourceCode,
        globals: {},
      };

      if (viewMode === "create") {
        await createTheme(themeData as CreateTheme);
      } else if (viewMode === "edit" && selectedTheme) {
        await updateTheme({
          id: selectedTheme.id,
          ...themeData,
        } as UpdateTheme);
      }

      setViewMode("list");
    } catch (err) {
      console.error("Failed to save theme:", err);
      setFormErrors({
        sourceCode: "Invalid theme code. Please check your syntax.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (theme: Theme) => {
    if (theme.readonly) return;

    if (confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) {
      try {
        await deleteTheme(theme.id);
      } catch (err) {
        console.error("Failed to delete theme:", err);
      }
    }
  };

  const renderPreview = () => {
    if (!formData.sourceCode.trim()) {
      return (
        <div
          className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
          style={{ height: "400px" }}
        >
          <p className="text-gray-500">No code to preview</p>
        </div>
      );
    }

    if (isCompilingPreview) {
      return (
        <div
          className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
          style={{ height: "400px" }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (previewError) {
      return (
        <div
          className="border rounded-lg p-4 bg-red-50 border-red-200"
          style={{ height: "400px" }}
        >
          <p className="text-red-600 text-sm">{previewError}</p>
        </div>
      );
    }

    if (compiledPreviewComponent) {
      const CompiledTheme = compiledPreviewComponent;
      return (
        <div
          className="border rounded-lg overflow-hidden bg-white"
          style={{ height: "400px" }}
        >
          <div className="h-full overflow-auto">
            <CompiledTheme
              data={SAMPLE_THEME_DATA}
              Link={MockLink}
              globals={{}}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className="border rounded-lg p-4 bg-gray-50 border-gray-200 flex items-center justify-center"
        style={{ height: "400px" }}
      >
        <p className="text-gray-500">
          Click "Refresh Preview" to see your theme
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackToSettingsLink />
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-medium">Error Loading Themes</h2>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToSettingsLink />

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Themes
                </h1>
                <p className="text-gray-600 mt-1">
                  Create and customize themes for your new tab page
                </p>
              </div>
              {viewMode === "list" && (
                <button
                  onClick={() => setViewMode("create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Theme
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === "list" && (
              <>
                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Search themes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Themes List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {theme.name}
                          </h3>
                          {theme.readonly && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                              Read-only
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTheme(theme);
                            setViewMode("view");
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>
                        {!theme.readonly && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTheme(theme);
                                setViewMode("edit");
                              }}
                              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(theme)}
                              className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredThemes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No themes found.</p>
                  </div>
                )}
              </>
            )}

            {(viewMode === "create" || viewMode === "edit") && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {viewMode === "create" ? "Create Theme" : "Edit Theme"}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Back to List
                      </button>
                    </div>

                    {/* Theme Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter theme name"
                      />
                      {formErrors.name && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Live Preview</h3>
                        <button
                          type="button"
                          onClick={refreshPreview}
                          disabled={
                            isCompilingPreview || !formData.sourceCode.trim()
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {isCompilingPreview
                            ? "Loading..."
                            : "Refresh Preview"}
                        </button>
                      </div>
                      {renderPreview()}
                    </div>

                    {/* Source Code Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Source Code
                      </label>
                      <div
                        className={`border rounded-md overflow-hidden ${
                          formErrors.sourceCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      >
                        <Editor
                          height="400px"
                          defaultLanguage="typescript"
                          value={formData.sourceCode}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              sourceCode: value || "",
                            })
                          }
                          beforeMount={configureMonacoEditor}
                          theme="vs-light"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: "on",
                            tabSize: 2,
                            insertSpaces: true,
                            formatOnPaste: true,
                            formatOnType: true,
                            suggest: {
                              filterGraceful: true,
                              snippetsPreventQuickSuggestions: false,
                              showSnippets: true,
                            },
                            quickSuggestions: {
                              other: true,
                              comments: false,
                              strings: true,
                            },
                            parameterHints: {
                              enabled: true,
                            },
                            acceptSuggestionOnCommitCharacter: true,
                            acceptSuggestionOnEnter: "on",
                            accessibilitySupport: "auto",
                            bracketPairColorization: { enabled: true },
                            folding: true,
                            foldingStrategy: "indentation",
                            showFoldingControls: "always",
                            renderWhitespace: "selection",
                            renderLineHighlight: "line",
                            cursorBlinking: "smooth",
                            smoothScrolling: true,
                            mouseWheelZoom: true,
                          }}
                        />
                      </div>
                      {formErrors.sourceCode && (
                        <p className="text-red-600 text-sm mt-1">
                          {formErrors.sourceCode}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        Write a React component function that receives{" "}
                        {`{ data, Link, globals }`} props. Type "theme-basic"
                        for a complete starter template, or "theme-card" for
                        bookmark card components.
                      </p>
                      <div className="text-xs text-gray-400 mt-1 space-y-1">
                        <p>
                          <strong>Quick tips:</strong>
                        </p>
                        <p>
                          • Use Ctrl+Space for autocomplete and TailwindCSS
                          class suggestions
                        </p>
                        <p>• Type "theme-" to see available code snippets</p>
                        <p>
                          • Access bookmark data via{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            data.categories
                          </code>
                        </p>
                        <p>
                          • Wrap links with{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            &lt;Link urlId="" url=""&gt;
                          </code>{" "}
                          for tracking
                        </p>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : viewMode === "create"
                          ? "Create Theme"
                          : "Update Theme"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {viewMode === "view" && selectedTheme && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    View Theme: {selectedTheme.name}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back to List
                    </button>
                    {!selectedTheme.readonly && (
                      <button
                        onClick={() => setViewMode("edit")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Theme Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Theme Name
                      </h3>
                      <p className="text-gray-700">{selectedTheme.name}</p>
                    </div>

                    {/* Preview */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Preview</h3>
                      <div
                        className="border rounded-lg overflow-hidden bg-white"
                        style={{ height: "400px" }}
                      >
                        <div className="h-full overflow-auto">
                          <selectedTheme.component
                            data={SAMPLE_THEME_DATA}
                            Link={MockLink}
                            globals={{}}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Source Code
                      </h3>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <Editor
                          height="300px"
                          defaultLanguage="typescript"
                          value={selectedTheme.sourceCode}
                          beforeMount={configureMonacoEditor}
                          theme="vs-light"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            wordWrap: "on",
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
