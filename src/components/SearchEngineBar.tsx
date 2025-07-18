"use client";

import { useState } from "react";

interface SearchEngineBarProps {
  className?: string;
}

export default function SearchEngineBar({
  className = "",
}: SearchEngineBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      launchGoogleSearch();
    }
  };

  const launchGoogleSearch = () => {
    if (!searchQuery.trim()) return;

    const encodedQuery = encodeURIComponent(searchQuery.trim());
    let searchUrl = "";

    switch (searchType) {
      case "images":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
        break;
      case "videos":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=vid`;
        break;
      case "shopping":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=shop`;
        break;
      case "short-videos":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=vid&tbs=dur:s`;
        break;
      case "news":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=nws`;
        break;
      case "forums":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=dsc`;
        break;
      case "web":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
        break;
      case "maps":
        searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
        break;
      case "books":
        searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=bks`;
        break;
      case "all":
      default:
        searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
        break;
    }

    window.location.href = searchUrl;
  };

  return (
    <div className={`flex items-center gap-2 flex-1 ${className}`}>
      <input
        type="text"
        id="googleSearchBox"
        placeholder="Search Google..."
        autoComplete="off"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-1 h-[46px] px-5 py-3 text-base bg-white border border-gray-300 rounded-[25px] shadow-md transition-all duration-300 ease-in-out focus:border-blue-500 focus:shadow-lg focus:outline-none"
      />
      <select
        id="googleSearchType"
        value={searchType}
        onChange={handleTypeChange}
        className="h-11 min-w-[90px] w-[110px] px-[15px] py-3 pr-[30px] text-sm border-2 border-gray-300 rounded-[20px] cursor-pointer transition-all duration-300 ease-in-out focus:border-blue-500 focus:shadow-lg focus:outline-none appearance-none bg-white bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e')] bg-no-repeat bg-[right_10px_50%] bg-[length:16px]"
      >
        <option value="all">All</option>
        <option value="images">Images</option>
        <option value="videos">Videos</option>
        <option value="shopping">Shopping</option>
        <option value="short-videos">Shorts</option>
        <option value="news">News</option>
        <option value="forums">Forums</option>
        <option value="web">Web</option>
        <option value="maps">Maps</option>
        <option value="books">Books</option>
      </select>
    </div>
  );
}
