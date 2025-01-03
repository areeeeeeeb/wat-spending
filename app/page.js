'use client';
import { useState, useEffect } from 'react';
import WatCard from "@/components/watCard";
import GooseHead from "@/components/goose/gooseHead";
import TransactionImporter from '@/components/transactionImporter';

export default function Home() {
  const [isGooseHappy, setIsGooseHappy] = useState(false);
  const [neckLength, setNeckLength] = useState(100);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    // SLIDE 1
    {
      title: (
        <h1 className="text-5xl sm:text-8xl max-w-full flex flex-wrap font-bold "> 
          <span className="text-yellow-400 italic">WAT</span> 
          <span className='flex flex-wrap'> 
            <span>Was</span>Spent? 
          </span> 
        </h1> 
      ),
      content: (
        <p className="text-xl text-wrap text-gray-700">
          WAT You Spent, WAT You Saved, WAT You Did.
        </p>
      ),
      buttonText: "Let's find out!"
    },
    // SLIDE 2
    {
      title: <h1 className="text-xl sm:text-4xl max-w-full font-bold">Smart Categorization</h1>,
      content: (
        <div className='w-full'>
          <TransactionImporter/>
        </div>
      ),
      buttonText: "Next"
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="h-screen bg-amber-100 flex items-center overflow-hidden">
      {/* Left half - Text content */}
      <div className="w-1/2 overflow-hidden relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentSlide * 100}%)`,  // Adjusting translation to match 50% width
          }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-full flex flex-col overflow-y-scroll space-y-5 p-10 justify-center"  // Set width to 1/2 for each slide
            >
              {slide.title}
              {slide.content}
              <button
                className="w-fit sm:text-2xl px-4 py-1 bg-yellow-400 rounded-md hover:rotate-2 hover:scale-110 transition-all"
                onMouseEnter={() => {
                  setIsGooseHappy(true);
                  setNeckLength(120);
                }}
                onMouseLeave={() => {
                  setIsGooseHappy(false);
                  setNeckLength(100);
                }}   
                onClick={handleNextSlide}
              >
                {slide.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Right half - WatCard + Goose */}
      <div className="w-1/2 transition-all z-1 max-w-md items-center justify-end">
        <div className="w-[200%] relative">
          <div className="absolute bottom-[5%] left-[13%] md:left-[20%] w-1/2 h-5/6 rounded-md">
            <GooseHead size="250" isHappy={isGooseHappy} maxDistance={neckLength} />
          </div>
          <WatCard />
        </div>
      </div>
    </div>
  );
}