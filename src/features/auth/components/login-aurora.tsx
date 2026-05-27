"use client";

import { useSyncExternalStore } from "react";
import { Aurora } from "@/components/ui/aurora";

const LIGHT_STOPS = ["#1d4ed8", "#60a5fa", "#4f46e5"];
const DARK_STOPS = ["#c2410c", "#fbbf24", "#ea580c"];

function subscribeDark(onStoreChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function LoginAurora() {
  const isDark = useSyncExternalStore(subscribeDark, getDarkSnapshot, getServerSnapshot);

  return (
    <Aurora
      colorStops={isDark ? DARK_STOPS : LIGHT_STOPS}
      amplitude={isDark ? 1.15 : 1.05}
      blend={0.52}
      speed={0.85}
      className="h-full w-full"
    />
  );
}
