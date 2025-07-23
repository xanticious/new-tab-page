"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { UrlTracker } from "@/utils/urlTracker";
import { ID } from "@/types";

interface TrackableLinkProps {
  urlId: ID;
  url: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const TrackableLink: React.FC<TrackableLinkProps> = ({
  urlId,
  url,
  className = "",
  children,
  onClick,
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const lastTrackTimeRef = useRef(0);

  // Debounced tracking to prevent duplicate events
  const trackActivation = useCallback(
    async (
      activationType:
        | "left-click"
        | "middle-click"
        | "right-click"
        | "keyboard"
        | "context-menu"
    ) => {
      const now = Date.now();
      if (now - lastTrackTimeRef.current < 100) {
        return; // Debounce rapid successive events
      }
      lastTrackTimeRef.current = now;

      await UrlTracker.trackActivation(urlId, activationType);
    },
    [urlId]
  );

  const handleClick = async (e: React.MouseEvent) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }

    // Track different types of clicks
    if (e.button === 0) {
      // Left click
      await trackActivation("left-click");
    } else if (e.button === 1) {
      // Middle click
      await trackActivation("middle-click");
    } else if (e.button === 2) {
      // Right click
      await trackActivation("right-click");
    }

    // For left clicks without modifier keys, let the browser handle navigation normally
    // For middle clicks and ctrl+clicks, the browser will open in new tab automatically
  };

  const handleAuxClick = async (e: React.MouseEvent) => {
    // Handle middle mouse button clicks specifically
    if (e.button === 1) {
      await trackActivation("middle-click");
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    // Handle Enter and Space key presses when focused
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      // Call custom onClick if provided
      if (onClick) {
        onClick();
      }

      // Track the keyboard activation
      await trackActivation("keyboard");

      // Navigate to the URL
      if (e.ctrlKey || e.metaKey) {
        // Open in new tab if Ctrl/Cmd is held
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        // Open in current tab
        window.location.href = url;
      }
    }
  };

  const handleContextMenu = async () => {
    // Track right-click (user might open in new tab/window from context menu)
    await trackActivation("context-menu");
  };

  // Detect when user navigates away (potentially from context menu actions)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This fires when the page is about to be unloaded
      // Could be from context menu "Open" action
      trackActivation("context-menu");
    };

    const handleVisibilityChange = () => {
      // This fires when the page becomes hidden
      // Could be from context menu "Open in new tab" action
      if (document.hidden) {
        trackActivation("context-menu");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [urlId, trackActivation]);

  return (
    <a
      ref={linkRef}
      href={url}
      className={className}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={0}
    >
      {children}
    </a>
  );
};
