import { useSyncExternalStore } from "react";

const mobileViewport = "(max-width: 640px)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(mobileViewport);
  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(mobileViewport).matches;

export const useMobileSheet = () =>
  useSyncExternalStore(subscribe, getSnapshot, () => false);
