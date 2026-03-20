"use client";

import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}

export default function AnimatedNumber({
  value,
  duration = 1500,
  format = (n) => n.toLocaleString(),
}: AnimatedNumberProps) {
  const { value: animatedValue } = useAnimatedCounter(value, duration);
  return <>{format(animatedValue)}</>;
}
