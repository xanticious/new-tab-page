"use client";

import { useState } from "react";

interface FilterBarProps {
  onFilter?: (query: string) => void;
  onClearFilters?: () => void;
  className?: string;
  showClearButton?: boolean;
}

export default function FilterBar({
  onFilter,
  onClearFilters,
  className = "",
  showClearButton = false,
}: FilterBarProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
    if (onFilter) {
      onFilter(e.target.value);
    }
  };

  const handleClearFilters = () => {
    setFilterQuery("");
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1">
        <input
          type="text"
          id="searchBox"
          placeholder="Filter your links..."
          autoComplete="off"
          value={filterQuery}
          onChange={handleInputChange}
          className="w-full h-[46px] px-5 py-3 text-base bg-white border border-gray-300 rounded-[25px] shadow-md transition-all duration-300 ease-in-out focus:border-blue-500 focus:shadow-lg focus:outline-none"
        />
      </div>

      {showClearButton && (
        <button
          id="clearFiltersBtn"
          onClick={handleClearFilters}
          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-[20px] shadow-md transition-all duration-300 ease-in-out hover:bg-red-500 active:scale-95 focus:outline-none whitespace-nowrap"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
