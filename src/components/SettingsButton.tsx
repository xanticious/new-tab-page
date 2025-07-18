"use client";

import { useRouter } from "next/navigation";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface SettingsButtonProps {
  className?: string;
}

export default function SettingsButton({
  className = "",
}: SettingsButtonProps) {
  const router = useRouter();

  const navigateToSettings = () => {
    router.push("/settings");
  };

  return (
    <button
      onClick={navigateToSettings}
      className={`fixed top-2.5 right-2.5 bg-white border-none cursor-pointer rounded-full p-0.5 shadow-md hover:shadow-lg transition-shadow duration-200 w-7 h-7 flex items-center justify-center z-[1001] ${className}`}
      aria-label="Open Settings"
      title="Settings"
    >
      <Cog6ToothIcon className="w-[18px] h-[18px] text-gray-600 hover:text-gray-800 transition-colors" />
    </button>
  );
}
