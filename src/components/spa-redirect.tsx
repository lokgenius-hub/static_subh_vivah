"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * GitHub Pages SPA redirect handler.
 * When 404.html redirects to /?p=/some/path, this component reads the path
 * from the query string and navigates to it client-side.
 */
export function SPARedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const { search, hash } = window.location;
    if (search.startsWith("?p=")) {
      const decoded = search
        .slice(3)
        .split("&q=")
        .map((s) => s.replace(/~and~/g, "&"))
        .join("?");
      const path = decoded + hash;
      // Clean the URL
      window.history.replaceState(null, "", path);
      router.replace(path);
    }
  }, [router]);

  return null;
}
