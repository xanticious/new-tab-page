"use client";

import React, { useState, useRef, useEffect } from "react";
import { Picture } from "@/types";

interface SearchablePictureSelectorProps {
  pictures: Picture[];
  selectedPictureId?: string;
  onSelect: (pictureId: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

// Icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export function SearchablePictureSelector({
  pictures,
  selectedPictureId,
  onSelect,
  placeholder = "Search pictures...",
  className = "",
}: SearchablePictureSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find selected picture
  const selectedPicture = selectedPictureId
    ? pictures.find((p) => p.id === selectedPictureId)
    : undefined;

  // Filter pictures based on search term
  const filteredPictures = pictures.filter((picture) => {
    // Handle undefined/null values safely
    const pictureName = picture.name?.toLowerCase() || "";
    const pictureAltText = picture.altText?.toLowerCase() || "";
    const searchLower = searchTerm?.toLowerCase() || "";

    // If no search term, show all pictures
    if (!searchLower) return true;

    return (
      pictureName.includes(searchLower) || pictureAltText.includes(searchLower)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredPictures.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          event.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredPictures.length
          ) {
            handleSelect(filteredPictures[highlightedIndex].id);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredPictures, highlightedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex + 1
      ] as HTMLElement; // +1 for "No picture" option
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (pictureId: string | undefined) => {
    onSelect(pictureId);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(undefined);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Input/Display */}
      <div
        onClick={handleInputClick}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedPicture ? (
              <>
                <img
                  src={selectedPicture.base64ImageData}
                  alt={selectedPicture.altText}
                  className="w-6 h-6 rounded object-cover flex-shrink-0"
                />
                <span className="text-sm text-gray-900 truncate">
                  {selectedPicture.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">No picture selected</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {selectedPicture && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Clear selection"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <ul ref={listRef} className="max-h-48 overflow-y-auto">
            {/* No picture option */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect(undefined)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                  !selectedPictureId
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                <div className="w-6 h-6 border border-gray-300 rounded bg-gray-50 flex-shrink-0" />
                <span>No picture</span>
              </button>
            </li>

            {/* Picture options */}
            {filteredPictures.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-500 text-center">
                No pictures found
              </li>
            ) : (
              filteredPictures.map((picture, index) => (
                <li key={picture.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(picture.id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors ${
                      selectedPictureId === picture.id
                        ? "bg-blue-50 text-blue-600"
                        : highlightedIndex === index
                        ? "bg-gray-100"
                        : "text-gray-700"
                    }`}
                  >
                    <img
                      src={picture.base64ImageData}
                      alt={picture.altText}
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{picture.name}</div>
                      {picture.altText !== picture.name && (
                        <div className="text-xs text-gray-500 truncate">
                          {picture.altText}
                        </div>
                      )}
                    </div>
                    {picture.readonly && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        readonly
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Results count */}
          {searchTerm && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredPictures.length} picture
              {filteredPictures.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
