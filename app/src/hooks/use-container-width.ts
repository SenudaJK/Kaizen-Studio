"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Pixel width of an element, kept current as it resizes. Charts draw at exactly this width so
 * their text stays readable on a phone instead of being shrunk (or scrolled sideways).
 * `fallback` is what the server and first paint use.
 */
export function useContainerWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(Math.round(element.clientWidth) || fallback);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return [ref, width] as const;
}
