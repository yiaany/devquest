"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /** Duration of the animation loop in seconds. */
  duration?: number;
  /** Width of the borders in pixels. */
  borderWidth?: number;
  /** Accent color to glow from. */
  colorFrom?: string;
  /** Fade color to glow to. */
  colorTo?: string;
  size?: number;
  className?: string;
}

/**
 * BorderBeam — animated border glow.
 *
 * Built using an SVG path overlay and an animated stroke-dashoffset to ensure
 * 100% cross-browser rendering, bypassing the fragile CSS mask-image bugs that
 * cause solid squares to render.
 */
export const BorderBeam = ({
  duration = 6,
  borderWidth = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  className,
}: BorderBeamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;
  const r = 12; // Matches card border-radius

  // Generate a closed rectangular path with rounded corners matching the container.
  const pathD = width && height
    ? `M ${r} 0 ` +
      `h ${width - 2 * r} ` +
      `a ${r} ${r} 0 0 1 ${r} ${r} ` +
      `v ${height - 2 * r} ` +
      `a ${r} ${r} 0 0 1 -${r} ${r} ` +
      `h -${width - 2 * r} ` +
      `a ${r} ${r} 0 0 1 -${r} -${r} ` +
      `v -${height - 2 * r} ` +
      `a ${r} ${r} 0 0 1 ${r} -${r} Z`
    : "";

  const perimeter = width && height ? 2 * (width + height) - 8 * r + 2 * Math.PI * r : 0;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
    >
      {width > 0 && height > 0 && (
        <svg
          style={{
            position: "absolute",
            top: -borderWidth / 2,
            left: -borderWidth / 2,
            width: width + borderWidth,
            height: height + borderWidth,
          }}
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="50%" stopColor={colorTo} stopOpacity={0.5} />
              <stop offset="100%" stopColor="transparent" stopOpacity={0} />
            </linearGradient>
          </defs>
          <motion.path
            d={pathD}
            stroke="url(#bb-grad)"
            strokeWidth={borderWidth}
            strokeDasharray={`${perimeter * 0.3} ${perimeter * 0.7}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -perimeter }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration,
            }}
          />
        </svg>
      )}
    </div>
  );
};
