"use client";

import { useState } from "react";
import SearchEngineBar from "./SearchEngineBar";
import FilterBar from "./FilterBar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarContainerProps {
  onGoogleSearch?: (query: string, type: string) => void;
  onFilter?: (query: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export default function SearchBarContainer({
  onFilter,
  onClearFilters,
  className = "",
}: SearchBarContainerProps) {
  const [showClearButton, setShowClearButton] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFilter = (query: string) => {
    setShowClearButton(query.length > 0);
    if (onFilter) {
      onFilter(query);
    }
  };

  const handleClearFilters = () => {
    setShowClearButton(false);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop View */}
      <div
        className={`hidden md:flex fixed top-5 left-1/2 transform -translate-x-1/2 w-full max-w-[900px] h-[46px] px-5 mb-7 items-center gap-5 z-[1000] ${className}`}
      >
        {/* Google Search Container */}
        <SearchEngineBar />

        {/* "Or" separator */}
        <div className="flex-shrink-0 mx-1 text-gray-500 font-medium">Or</div>

        {/* Links Search Container */}
        <FilterBar
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
          showClearButton={showClearButton}
          className="flex-1"
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden fixed top-5 right-11 z-[1000]">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle search menu"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-100 bg-white rounded-lg shadow-xl border border-gray-200 p-4 space-y-4">
            {/* Mobile Google Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Search
              </label>
              <SearchEngineBar />
            </div>

            {/* Mobile "Or" separator */}
            <div className="text-center text-gray-500 font-medium">Or</div>

            {/* Mobile Links Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Links
              </label>
              <FilterBar
                onFilter={handleFilter}
                onClearFilters={handleClearFilters}
                showClearButton={showClearButton}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
