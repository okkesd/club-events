"use client";

import { useEffect } from "react";

export default function ThemeFavicon() {
  useEffect(() => {
    const href = "/favicons/calendar-vibrant.svg?v=2";

    const syncIcons = () => {
      // Update every tab-icon candidate, including the ICO fallback, so browsers
      // cannot choose an old icon. Touch icons keep their original metadata.
      const icons = document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
      for (const icon of icons) {
        if (icon.getAttribute("href") !== href) icon.setAttribute("href", href);
        if (icon.type !== "image/svg+xml") icon.type = "image/svg+xml";
        if (icon.getAttribute("sizes") !== "any") icon.setAttribute("sizes", "any");
      }
    };

    syncIcons();
    // Next.js can replace head metadata after navigation or streaming. Reapply
    // the chosen theme to newly added/replaced links without changing their DOM ownership.
    const observer = new MutationObserver(syncIcons);
    observer.observe(document.head, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["href", "rel", "type", "sizes"],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
