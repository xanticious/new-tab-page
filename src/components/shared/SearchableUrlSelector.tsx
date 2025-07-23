"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Url, Picture } from "@/types";

interface SearchableUrlSelectorProps {
  urls: Url[];
  pictures: Picture[];
  selectedUrlIds: string[];
  onSelectionChange: (urlIds: string[]) => void;
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

const CheckIcon = ({ className }: { className?: string }) => (
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
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const GripVerticalIcon = ({ className }: { className?: string }) => (
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
      d="M8 9h.01M12 9h.01M16 9h.01M8 15h.01M12 15h.01M16 15h.01"
    />
  </svg>
);

const SortAscendingIcon = ({ className }: { className?: string }) => (
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
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
);

const AdjustmentsIcon = ({ className }: { className?: string }) => (
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
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
    />
  </svg>
);

export function SearchableUrlSelector({
  urls,
  pictures,
  selectedUrlIds,
  onSelectionChange,
  placeholder = "Search URLs...",
  className = "",
}: SearchableUrlSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [orderMode, setOrderMode] = useState<"alphabetical" | "custom">(
    "alphabetical"
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Create lookup map for pictures for efficiency
  const picturesMap = pictures.reduce((map, picture) => {
    map[picture.id] = picture;
    return map;
  }, {} as Record<string, Picture>);

  // Filter URLs based on search term
  const filteredUrls = urls.filter((url) => {
    const urlName = url.name?.toLowerCase() || "";
    const urlAddress = url.url?.toLowerCase() || "";
    const searchLower = searchTerm?.toLowerCase() || "";

    // If no search term, show all URLs
    if (!searchLower) return true;

    return urlName.includes(searchLower) || urlAddress.includes(searchLower);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex < filteredUrls.length - 1 ? prevIndex + 1 : 0
          );
          break;

        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : filteredUrls.length - 1
          );
          break;

        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredUrls.length) {
            const url = filteredUrls[highlightedIndex];
            handleToggleUrl(url.id);
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredUrls]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggleUrl = (urlId: string) => {
    if (selectedUrlIds.includes(urlId)) {
      onSelectionChange(selectedUrlIds.filter((id) => id !== urlId));
    } else {
      if (orderMode === "alphabetical") {
        // For alphabetical mode, just add to the array - sorting happens in display
        onSelectionChange([...selectedUrlIds, urlId]);
      } else {
        // For custom mode, add to the end to maintain current order
        onSelectionChange([...selectedUrlIds, urlId]);
      }
    }
  };

  const handleRemoveUrl = (urlId: string) => {
    onSelectionChange(selectedUrlIds.filter((id) => id !== urlId));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrderedIds = [...selectedUrlIds];
    const [draggedId] = newOrderedIds.splice(draggedIndex, 1);
    newOrderedIds.splice(dropIndex, 0, draggedId);

    onSelectionChange(newOrderedIds);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Get selected URLs in the correct order
  const selectedUrls =
    orderMode === "alphabetical"
      ? urls
          .filter((url) => selectedUrlIds.includes(url.id))
          .sort((a, b) => a.name.localeCompare(b.name))
      : (selectedUrlIds
          .map((id) => urls.find((url) => url.id === id))
          .filter(Boolean) as Url[]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Selected URLs Display */}
      {selectedUrls.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected URLs ({selectedUrls.length})
            </span>
            <div className="flex items-center gap-3">
              {/* Order Mode Toggle */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="orderMode"
                    value="alphabetical"
                    checked={orderMode === "alphabetical"}
                    onChange={(e) =>
                      setOrderMode(e.target.value as "alphabetical" | "custom")
                    }
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <SortAscendingIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Alphabetical</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="orderMode"
                    value="custom"
                    checked={orderMode === "custom"}
                    onChange={(e) =>
                      setOrderMode(e.target.value as "alphabetical" | "custom")
                    }
                    className="text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <AdjustmentsIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Custom</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Clear all
              </button>
            </div>
          </div>

          {orderMode === "alphabetical" ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
              {selectedUrls.map((url) => (
                <div
                  key={url.id}
                  className="inline-flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {url.picture && picturesMap[url.picture] && (
                    <Image
                      src={picturesMap[url.picture].base64ImageData}
                      alt={picturesMap[url.picture].altText}
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded object-cover"
                    />
                  )}
                  <span className="truncate max-w-24">{url.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(url.id)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
              {selectedUrls.length > 1 && (
                <div className="text-xs text-gray-500 italic pb-1">
                  Drag items to reorder them
                </div>
              )}
              {selectedUrls.map((url, index) => (
                <div
                  key={url.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-2 p-2 bg-white border rounded-lg cursor-move transition-all ${
                    draggedIndex === index ? "opacity-50 scale-95" : ""
                  } ${
                    dragOverIndex === index && draggedIndex !== index
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <GripVerticalIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {url.picture && picturesMap[url.picture] && (
                    <Image
                      src={picturesMap[url.picture].base64ImageData}
                      alt={picturesMap[url.picture].altText}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {url.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {url.url}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(url.id)}
                    className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
            />
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
            {filteredUrls.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchTerm ? "No URLs found" : "No URLs available"}
              </div>
            ) : (
              <ul ref={listRef} className="max-h-64 overflow-y-auto">
                {filteredUrls.map((url, index) => {
                  const isSelected = selectedUrlIds.includes(url.id);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li key={url.id}>
                      <button
                        type="button"
                        className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors ${
                          isHighlighted ? "bg-blue-50" : ""
                        } ${isSelected ? "bg-blue-25" : ""}`}
                        onClick={() => handleToggleUrl(url.id)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckIcon className="h-3 w-3 text-white" />
                          )}
                        </div>

                        {/* URL Picture */}
                        {url.picture && picturesMap[url.picture] && (
                          <div className="flex-shrink-0">
                            <Image
                              src={picturesMap[url.picture].base64ImageData}
                              alt={picturesMap[url.picture].altText}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded object-cover"
                            />
                          </div>
                        )}

                        {/* URL Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {url.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {url.url}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
