'use client';
import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';

const AnchoredLine = ({ position, duration, strokeWidth }) => {
  const lineRef = useRef(null);

  useEffect(() => {
    // Animate the line attributes whenever position or duration changes
    gsap.to(lineRef.current, {
      attr: {
        x2: `calc(50% + ${position.x}px)`,
        y2: `calc(50% + ${position.y}px)`,
      },
      duration: duration,
      ease: 'power1.out',
    });
  }, [position, duration]);

  return (
    <svg className="absolute w-screen h-full" style={{ pointerEvents: 'none' }}>
      <line
        ref={lineRef} 
        x1="50%"
        y1="100%"
        x2="50%"
        y2="50%"
        stroke="black"
        strokeWidth={strokeWidth}
        className="shadow-lg"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AnchoredLine;
