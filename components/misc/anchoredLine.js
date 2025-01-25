'use client';
import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';

const AnchoredLine = ({ position, duration, strokeWidth }) => {
  const lineRef = useRef(null);

  useEffect(() => {
    const containerWidth = lineRef.current.parentElement.clientWidth;
    const containerHeight = lineRef.current.parentElement.clientHeight;
    const x2Value = containerWidth * 0.5 + position.x; // Calculate absolute x2
    const y2Value = containerHeight * 0.5 + position.y; // Calculate absolute y2
    gsap.to(lineRef.current, {
      attr: {
        x2: x2Value,
        y2: y2Value
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
