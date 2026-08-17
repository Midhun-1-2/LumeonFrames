import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { jumpToTop } from "@/lib/scroll";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // In a single-page app the browser's own scroll restoration fights every
  // route change, dropping you back at the previous page's offset.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    jumpToTop();
  }, [pathname]);

  return null;
}
