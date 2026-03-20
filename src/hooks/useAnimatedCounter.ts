"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useAnimatedCounter(
  endValue: number,
  duration: number = 1500,
  startOnMount: boolean = true
) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setValue(Math.round(eased * endValue));

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [endValue, duration]);

  const start = useCallback(() => {
    setValue(0);
    cancelAnimationFrame(frameRef.current);
    startTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    if (startOnMount && endValue > 0) {
      start();
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [startOnMount, endValue, start]);

  return { value, start };
}
