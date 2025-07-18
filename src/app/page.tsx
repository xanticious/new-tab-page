"use client";

import SearchBarContainer from "@/components/SearchBarContainer";
import SettingsButton from "@/components/SettingsButton";
import { MainBookmarkView, DatabaseProvider } from "@/components";

export default function Home() {
  const handleFilter = (query: string) => {
    console.log("Filtering links with query:", query);
    // TODO: Implement filtering logic
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
    // TODO: Implement clear filters logic
  };

  return (
    <DatabaseProvider>
      <div className="min-h-screen bg-gray-50">
        <SettingsButton />
        <SearchBarContainer
          onFilter={handleFilter}
          onClearFilters={handleClearFilters}
        />
        <MainBookmarkView />
      </div>
    </DatabaseProvider>
  );
}
