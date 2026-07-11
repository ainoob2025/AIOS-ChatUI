"use client";

import { useEffect } from "react";
import { useChatStore } from "@/lib/store";

const SCALES = ["scale-sm", "scale-md", "scale-lg", "scale-xl"] as const;

export default function ScaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scale = useChatStore((s) => s.settings.uiScale);
  const scaleClass = `scale-${scale}`;

  useEffect(() => {
    const html = document.documentElement;
    // Remove all scale classes, add the current one
    html.classList.remove(...SCALES);
    html.classList.add(scaleClass);
  }, [scaleClass]);

  return <>{children}</>;
}
