import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BackToSettingsLinkProps {
  className?: string;
}

export function BackToSettingsLink({
  className = "",
}: BackToSettingsLinkProps) {
  return (
    <div className={`mt-8 pt-6 border-t border-gray-200 ${className}`}>
      <Link
        href="/settings"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeftIcon className="mr-2 w-4 h-4" aria-hidden="true" />
        Back to Settings
      </Link>
    </div>
  );
}
