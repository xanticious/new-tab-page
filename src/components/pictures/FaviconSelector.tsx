"use client";

import React, { useState } from "react";
import NextImage from "next/image";

interface FaviconOption {
  size: string;
  url: string;
  actualSize?: { width: number; height: number };
  isLoaded: boolean;
  hasError: boolean;
}

interface FaviconSelectorProps {
  onFaviconSelected: (
    base64OrUrl: string,
    size: string,
    isUrl?: boolean
  ) => void;
  className?: string;
}

export const FaviconSelector: React.FC<FaviconSelectorProps> = ({
  onFaviconSelected,
  className = "",
}) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [faviconOptions, setFaviconOptions] = useState<FaviconOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizes = ["16", "32", "64", "128", "256", "512"];

  const extractDomain = (url: string): string => {
    try {
      // Add protocol if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url; // Return as-is if URL parsing fails
    }
  };

  const getImageDimensions = (
    src: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  };

  const convertImageToBase64 = async (src: string): Promise<string> => {
    try {
      // Try to fetch the image as a blob to avoid CORS issues
      const response = await fetch(src, {
        mode: "cors",
        cache: "default",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (fetchError) {
      // If fetch fails due to CORS, we'll need to use a different approach
      // For now, let's try using a CORS proxy or just return the URL
      console.warn(
        "Direct fetch failed, trying alternative approach:",
        fetchError
      );

      // Try using a public CORS proxy
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          src
        )}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Proxy fetch failed: ${response.status}`);
        }

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        // If all else fails, we might need to just use the URL directly
        // This would require changing the parent component to handle URLs instead of base64
        throw new Error(
          "Unable to convert image to base64 due to CORS restrictions"
        );
      }
    }
  };

  const loadFavicons = async () => {
    if (!websiteUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setFaviconOptions([]);
    setSelectedSize("");

    const domain = extractDomain(websiteUrl.trim());

    const options: FaviconOption[] = sizes.map((size) => ({
      size,
      url: `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
      isLoaded: false,
      hasError: false,
    }));

    setFaviconOptions(options);

    // Load each favicon and check its actual dimensions
    for (let i = 0; i < options.length; i++) {
      try {
        const actualSize = await getImageDimensions(options[i].url);
        options[i].actualSize = actualSize;
        options[i].isLoaded = true;

        // If this is the largest successfully loaded size, select it by default
        if (!selectedSize && actualSize.width >= 32) {
          setSelectedSize(options[i].size);
        }
      } catch {
        options[i].hasError = true;
      }

      // Update state after each image loads
      setFaviconOptions([...options]);
    }

    // If no size was auto-selected, try to select the largest working one
    if (!selectedSize) {
      const workingOptions = options.filter(
        (opt) => opt.isLoaded && !opt.hasError
      );
      if (workingOptions.length > 0) {
        setSelectedSize(workingOptions[workingOptions.length - 1].size);
      } else {
        setError("Unable to find that site's favicon");
      }
    }

    setIsLoading(false);
  };

  const handleSelectFavicon = async () => {
    const selectedOption = faviconOptions.find(
      (opt) => opt.size === selectedSize
    );
    if (!selectedOption || selectedOption.hasError) return;

    try {
      setError(null); // Clear any previous errors
      const base64 = await convertImageToBase64(selectedOption.url);
      onFaviconSelected(base64, selectedSize, false);
    } catch (err) {
      console.error("Failed to convert favicon to base64:", err);
      console.log("Falling back to using URL directly...");

      // Fallback: pass the URL directly instead of base64
      onFaviconSelected(selectedOption.url, selectedSize, true);

      setError(
        "Note: Using direct URL due to browser security restrictions. The favicon should still work correctly."
      );
    }
  };

  const isOptionDisabled = (option: FaviconOption): boolean => {
    return Boolean(
      option.hasError ||
        (option.isLoaded &&
          option.actualSize &&
          option.actualSize.width <= 16 &&
          option.size !== "16")
    );
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com or example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && loadFavicons()}
            />
            <button
              type="button"
              onClick={loadFavicons}
              disabled={!websiteUrl.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>

        {faviconOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Sizes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
              {faviconOptions.map((option) => {
                const disabled = isOptionDisabled(option);
                return (
                  <div
                    key={option.size}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      disabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                        : selectedSize === option.size
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => !disabled && setSelectedSize(option.size)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="favicon-size"
                        value={option.size}
                        checked={selectedSize === option.size}
                        onChange={() =>
                          !disabled && setSelectedSize(option.size)
                        }
                        disabled={disabled}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {option.size}×{option.size}
                        </div>
                        {option.actualSize && (
                          <div className="text-xs text-gray-500">
                            Actual: {option.actualSize.width}×
                            {option.actualSize.height}
                          </div>
                        )}
                        {option.hasError && (
                          <div className="text-xs text-red-500">
                            Failed to load
                          </div>
                        )}
                      </div>
                      {option.isLoaded && !option.hasError && (
                        <NextImage
                          src={option.url}
                          alt={`${option.size}×${option.size} favicon`}
                          width={Math.min(parseInt(option.size), 64)}
                          height={Math.min(parseInt(option.size), 64)}
                          className="rounded border"
                          style={{
                            width: `${Math.min(parseInt(option.size), 64)}px`,
                            height: `${Math.min(parseInt(option.size), 64)}px`,
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSize && (
              <button
                type="button"
                onClick={handleSelectFavicon}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Use Selected Favicon
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
