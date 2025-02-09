'use client';
import WatCard from "@/components/watCard";
import GooseHead from "@/components/goose/gooseHead";
import { useGoose } from '@/components/providers/goose-provider';
import AnalysisSlides from '@/components/analysisSlides';
import { useState, useEffect } from "react";

export default function Home() {
  // GOOSE
  const gooseRef = useGoose();
  const [gooseSize, setGooseSize] = useState(250);
  useEffect(() => {
    const calculateGooseSize = () => {
      const width = window.innerWidth;
      const newSize = Math.min(Math.max(width * 0.2, 200), 300);
      setGooseSize(Math.round(newSize));
    };
    // Calculate initial size
    calculateGooseSize();
    // Add resize listener
    window.addEventListener('resize', calculateGooseSize);
    // Cleanup
    return () => window.removeEventListener('resize', calculateGooseSize);
  }, []);

  // PAGE
  return (
    <div className="relative w-full h-screen bg-amber-100 flex items-center mask-gradient-right overflow-hidden">
      {/* Text content */}
      <div
        className="w-full overflow-hidden relative"
      >
        <AnalysisSlides/>
      </div>
      {/* WatCard + Goose */}
      <div className="absolute left-1/2 top-1/3 sm:top-0 w-full h-full transition-all z-1 flex items-center justify-start">
        <div className="w-[200%] max-w-5xl relative ">
          <div className="absolute bottom-[5%] left-[13%] md:left-[20%] w-1/2 h-5/6 rounded-md">
            <GooseHead
              ref={gooseRef}
              size={gooseSize}
              mode="FOLLOW"
            />
          </div>
          <WatCard />
        </div>
      </div>
    </div>
  );
}