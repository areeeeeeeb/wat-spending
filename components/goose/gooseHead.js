'use client';


import React, { useState, useEffect, useRef } from 'react';
import Base from './base.svg'
import TopBeak from './top_beak.svg'
import BottomBeak from './bottom_beak.svg'
import SpeechBubble from '../speechBubble';

const GooseHead = ({
    size = 200,
    isHappy = false,
    maxDistance = size / 5
}) => {
    
    const scale = size / 111;
  
    // Scale all dimensions accordingly
    const eyeSize = {
        outer: 30 * scale,
        inner: 12 * scale
    };

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [mouthDeg, setMouthDeg] = useState(0);
    const prevAngleRef = useRef(0);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowUp") {
                setMouthDeg((prev) => Math.min(prev + 15, 35)); // Increase mouthDeg, max 70
            } else if (event.key === "ArrowDown") {
                setMouthDeg((prev) => Math.max(prev - 40, 0)); // Decrease mouthDeg, min 0
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setMouthDeg(isHappy ? 26 : 0);
    }, [isHappy])
  
    useEffect(() => {
      const handleMouseMove = (event) => {
        if (!containerRef.current) return;
  
        const bounds = containerRef.current.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        // HEAD POSITION / NECK STRETCH
        // Calculate distance to mouse
        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Limit the distance the head can move
        const scaledDistance = Math.min(distance, maxDistance);
        const scale = scaledDistance / distance;
        // Update head position
        const newX = dx * scale;
        const newY = dy * scale;
        setPosition({ x: newX, y: newY });

        // HEAD ROTATION
        // Calculate angle
        let angle = Math.atan2(
          event.clientY - centerY,
          event.clientX - centerX
        ) * (180 / Math.PI);
        // Make face mouse
        angle = angle + 180; 
        // Normalize to prevent sudden jumps
        const prevAngle = prevAngleRef.current; 
        if (Math.abs(angle - prevAngle) > 180) {
            if (angle < prevAngle) {
              angle += 360;
            } else {
              angle -= 360;
            }
        }
        while (angle > prevAngle + 180) angle -= 360;
        while (angle < prevAngle - 180) angle += 360;
        // Apply rotation
        prevAngleRef.current = angle;
        setRotation(angle);
      };
  
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [position]);


    return (
        <div className="relative h-full rounded-xl pointer-events-none w-full flex items-center justify-center ">
            {/* NECK */}
            <svg className="w-screen h-full" style={{ pointerEvents: 'none' }}>
                <line
                    x1="50%"
                    y1="100%"
                    x2={`calc(50% + ${position.x}px)`}
                    y2={`calc(50% + ${position.y}px)`}
                    stroke="black"
                    strokeWidth={`${size / 2}`}
                    className='shadow-lg'
                    strokeLinecap="round"
                    style={{
                        transition: 'x2 0.05s ease-out, y2 0.05s ease-out',
                    }}
                />
            </svg>

            {/* HEAD */}
            <div
                className="absolute z-20 flex items-center justify-center"
                ref={containerRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition: 'transform 0.04s ease-out'
                }}
            >
                {mouthDeg > 20 && (
                    <div className='translate-x-[-120%] drop-shadow-none '> 
                        <SpeechBubble rotation={rotation} />
                    </div>
                )}
                
                {/* HEAD BASE */}
                <Base 
                    width={size} 
                    height={size} 
                    viewBox="0 0 111 111" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute drop-shadow-2xl"
                />
                
                {/* EYEBALL */}
                <div 
                    className='absolute rounded-full bg-white flex items-center justify-center'
                    style={{
                    width: `${eyeSize.outer}px`,
                    height: `${eyeSize.outer}px`,
                    transform: `translateY(-${4 * scale}px) translateX(${1 * scale}px)`
                    }}
                >
                    <div 
                    className='rounded-full bg-black'
                    style={{
                        width: `${eyeSize.inner}px`,
                        height: `${eyeSize.inner}px`
                    }}
                    />
                </div>
                <BottomBeak                     
                    width={82.1 * scale} 
                    height={52.96 * scale} 
                    viewBox="0 0 82.1 52.96"
                    className="absolute transition-all drop-shadow-2xl"
                    style={{
                        transform: `translateX(-68%) translateY(23%) rotate(${-mouthDeg / 5}deg)`,
                        transformOrigin: `100% 62.8%`
                    }}
                />

                {/* BEAK */}
                <TopBeak 
                    width={97.78 * scale} 
                    height={36.06 * scale} 
                    viewBox="0 0 97.78 36.06"
                    className="absolute transition-all drop-shadow-2xl"
                    style={{
                        transformOrigin: `100% 80%`,
                        transform: `translateX(-65%)  rotate(${mouthDeg}deg)`
                    }}
                />
            </div>
    </div>
  );
};

export default GooseHead;