'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Base from './base.svg'
import TopBeak from './top_beak.svg'
import BottomBeak from './bottom_beak.svg'
import SpeechBubble from '../speechBubble';
import AnchoredLine from '../misc/anchoredLine';
import gsap from 'gsap';

const GooseHead = forwardRef(({
    size = 200,
    isHappy = false,
    maxDistance = size / 5,
    speech = "",
    mode = "FOLLOW"
}, ref) => {
    // SCALE
    const scale = size / 111;
    const eyeSize = {
        outer: 30 * scale,
        inner: 12 * scale
    };

    // REFERENCES
    const prevAngleRef = useRef(0);
    const headRef = useRef(null);
    const beakRef = useRef(null);

    // EATING
    const [isEating, setIsEating] = useState(false);
    const eat = async (targetElement) => {
        if (typeof window === 'undefined' || !headRef.current) return;
        setIsEating(true);
        // Get positions
        setRotation(Math.round(rotation / 360) * 360);
        setPosition({ x: 0, y: 0 });
        await new Promise(resolve => setTimeout(resolve, 200));
        const beakRect = beakRef.current.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        // Calculate relative Y position from head to target
        const relativeY = targetRect.top - beakRect.top;
        // Step 2: Open mouth
        setMouthDeg(30);
        await new Promise(resolve => setTimeout(resolve, 300));
        // Step 3: Move to rightmost edge
        const screenWidth = window.innerWidth;
        setPosition({ x: -screenWidth/2, y: relativeY });
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Step 4: Close mouth
        setMouthDeg(0);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Step 5: Return to original position and mode
        setPosition({ x: 0, y: 0 });
        await new Promise(resolve => setTimeout(resolve, 350));
        setIsEating(false);
    };
    // Expose eat function to parent
    useImperativeHandle(ref, () => ({
        eat
    }), []);

    // EMOTIONS
    useEffect(() => {
        setMouthDeg(isHappy ? 26 : 0);
    }, [isHappy]);
    
    // CONTROLS
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

    // HEAD TRANSFORMATIONS
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [mouthDeg, setMouthDeg] = useState(0);
    useEffect(() => {
        if (typeof window === 'undefined') return; // Guard for SSR
        if (isEating) return; // Skip normal movement if eating

        if (mode === "BOBBING") {
            const bobbingAnimation = gsap.to({}, {
                duration: 2, // 2 seconds for a full cycle
                repeat: -1, // Repeat indefinitely
                onUpdate: () => {
                    const cycle = (bobbingAnimation.progress() % 1);
                    const y = -16 + (10 * Math.sin(cycle * 2 * Math.PI));
                    setPosition({ x: -100, y });
                },
                onUpdateParams: []
            });
            return () => {
                bobbingAnimation.kill();
            };
        } else if (mode === "FOLLOW") {
            const handleMouseMove = (event) => {
                if (!headRef.current) return;

                const bounds = headRef.current.getBoundingClientRect();
                const centerX = bounds.left + bounds.width / 2;
                const centerY = bounds.top + bounds.height / 2;

                // HEAD POSITION / NECK STRETCH
                // Calculate distance to mouse
                const dx = event.clientX - centerX;
                const dy = event.clientY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const scaledDistance = Math.min(distance, maxDistance);
                const scale = scaledDistance / distance;
                const newX = dx * scale;
                const newY = dy * scale;
                setPosition({ x: newX, y: newY });

                // HEAD ROTATION
                // Calculate angle
                let angle = Math.atan2(
                    event.clientY - centerY,
                    event.clientX - centerX
                ) * (180 / Math.PI);
                angle = angle + 180;
                // Normalize to prevent sudden jumps
                const prevAngle = prevAngleRef.current;
                if (Math.abs(angle - prevAngle) > 180) {
                    if (angle < prevAngle) angle += 360;
                    else angle -= 360;
                }
                while (angle > prevAngle + 180) angle -= 360;
                while (angle < prevAngle - 180) angle += 360;
                prevAngleRef.current = angle;
                setRotation(angle);
            };

            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [mode, maxDistance, isEating]);

    // COMPONENT
    return (
        <div className="relative h-full rounded-xl pointer-events-none w-full flex items-center justify-center ">
            {/* NECK */}
            <AnchoredLine
                position={position} 
                duration={0.15} 
                strokeWidth={size/2} 
            />
            {/* HEAD + SPEECH BUBBLE */}
            <div
                className="absolute z-20 flex items-center justify-center"
                ref={headRef}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    transition:  "transform 0.15s ease-out" 
                }}
            >
                {/* SPEECH BUBBLE */}
                {mouthDeg > 20 && speech != ""  &&(
                    <div className='translate-x-[-120%] drop-shadow-none '> 
                        <SpeechBubble text={speech} />
                    </div>
                )}
                
                {/* HEAD BASE */}
                <Base 
                    width={size} 
                    height={size} 
                    viewBox="0 0 111 111" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute drop-shadow-2xl "
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

                {/* BEAK */}
                <BottomBeak                     
                    width={82.1 * scale} 
                    height={52.96 * scale} 
                    ref={beakRef}
                    viewBox="0 0 82.1 52.96"
                    className="absolute transition-all drop-shadow-2xl"
                    style={{
                        transform: `translateX(-69%) translateY(23%) rotate(${-mouthDeg / 5}deg)`,
                        transformOrigin: `100% 62.8%`
                    }}
                />
                <TopBeak 
                    width={97.78 * scale} 
                    height={36.06 * scale} 
                    viewBox="0 0 97.78 36.06"
                    className="absolute transition-all drop-shadow-2xl"
                    style={{
                        transformOrigin: `100% 80%`,
                        transform: `translateX(-66%)  rotate(${mouthDeg}deg)`
                    }}
                />
            </div>
    </div>
    );
});

export default GooseHead;