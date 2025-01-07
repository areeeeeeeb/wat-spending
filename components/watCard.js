'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import GooseHead from './goose/gooseHead';

const useContainerScale = (containerRef, baseWidth) => {
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    if (!containerRef.current) return;
    const calculateScale = (entries) => {
      const containerWidth = entries[0].contentRect.width;
      const newScale = containerWidth / baseWidth;
      setScale(newScale);
    };
    const observer = new ResizeObserver((entries) => calculateScale(entries));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [baseWidth]);

  return scale;
};

const WatCard = ({ studentInfo = {
  firstName: "MISTER",
  lastName: "GOOSE",
  program: "MATHEMATICS",
  status: "UNDERGRADUATE",
  number: "21063865",
  imageUrl: "https://www.allaboutbirds.org/guide/assets/photo/59953191-480px.jpg"
} }) => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const baseWidth = 640;
  const scale = useContainerScale(containerRef, baseWidth);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'rotateX(0deg) rotateY(-20deg)';

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const rotateY = ((x / rect.width) - 0.5) * 30;
      const rotateX = ((y / rect.height) - 0.5) * -30;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
      card.style.transform = 'rotateX(0deg) rotateY(-20deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="w-full"
      >
        <div 
          className="relative group"
          style={{
            width: '100%',
            aspectRatio: "5/3",
            perspective: "2000px",
            transformStyle: "preserve-3d"
          }}
        >
          {/* CARD BODY */}
          <div
            ref={cardRef}
            className=" rounded-xl  flex w-full h-full z-[5] overflow-hidden transition-transform duration-200 ease-out"
            style={{
              boxShadow: `
                0 ${75 * scale}px ${100 * scale}px -${15 * scale}px rgba(0, 0, 0, 0.3),
                0 ${10 * scale}px ${15 * scale}px -${3 * scale}px rgba(0, 0, 0, 0.3),
                0 ${1 * scale}px ${3 * scale}px rgba(0, 0, 0, 0.2)
              `,
              background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
              mask: 'radial-gradient(ellipse 97% 97%, #fff 95%, transparent 95%) 26.5% 74%/37.2% 71.5% no-repeat, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude'
            }}
          >
            {/* BLACK STRIPE */}
            <div 
              className="h-full relative" 
              style={{ 
                width: `${80 * scale}px`, 
                marginLeft: `${16 * scale}px`,
                background: "linear-gradient(to right,rgb(40, 40, 40),rgb(40, 40, 40))",
              }}
            >
              <span 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
                style={{ fontSize: `${48 * scale}px` }}
              >
                <span className="text-yellow-400 font-bold">WAT</span>
                <span className="text-white">CARD</span>
              </span>
            </div>

            {/* CARD CONTENT */}
            <div className="w-full flex flex-col justify-start space-y-1 md:space-y-3" style={{ margin: `${28 * scale}px` }}>
              {/* WATERLOO LOGO + WORDMARK */}
              <div className="flex items-center space-x-1 md:space-x-2">
                <Image  
                  src="emblem.svg"
                  width={(45 * scale * (112.58/135.7))}
                  height={45 * scale}
                  alt="Description"
                  priority={false}
                />
                <span className="flex flex-col items-center">
                  <span className="leading-none font-bold tracking-[.2em] " style={{ fontSize: `${12 * scale}px` }}>
                    UNIVERSITY OF
                  </span>
                  <span className="font-bold leading-none h-fit" style={{ fontSize: `${30 * scale}px` }}>
                    WATERLOO
                  </span>
                </span>
              </div>
              
              <div className="w-full h-full flex flex-row " style={{ gap: `${15 * scale}px` }}>
                {/* STUDENT PHOTO */}
                <div className='w-full rounded-md items-center justify-center flex'>
                  
                </div>
                {/* STUDENT INFO */}
                <div className="w-full h-full flex flex-col" style={{ padding: `${15 * scale}px` }}>
                  <span className="font-bold" style={{ fontSize: `${20 * scale}px` }}>{studentInfo.firstName}</span>
                  <span className="font-bold" style={{ fontSize: `${20 * scale}px` }}>{studentInfo.lastName}</span>
                  <span className="" style={{ fontSize: `${20 * scale}px` }}>{studentInfo.number}</span>
                  <span className="font-medium" style={{ fontSize: `${20 * scale}px` }}>{studentInfo.program}</span>
                  <span className="font-medium" style={{ fontSize: `${20 * scale}px` }}>{studentInfo.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatCard;