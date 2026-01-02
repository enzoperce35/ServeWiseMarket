import { useEffect, useState } from "react";

export const MOBILE_TABLET_WIDTH = 768;

/**
 * 📱 Detect mobile or tablet with resize support
 */
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth <= MOBILE_TABLET_WIDTH
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= MOBILE_TABLET_WIDTH);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobileOrTablet;
}

/**
 * 🖥 Desktop only
 * (example future function)
 */
export function useIsDesktop() {
  const isMobileOrTablet = useIsMobileOrTablet();
  return !isMobileOrTablet;
}

/**
 * 📐 Raw screen width (example future function)
 */
export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
