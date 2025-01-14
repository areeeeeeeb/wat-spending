'use client';
import { useState, useEffect, useRef } from 'react';
import WatCard from "@/components/watCard";
import GooseHead from "@/components/goose/gooseHead";
import TransactionImporter from '@/components/transactionImporter';
import { useTransactions } from '@/components/providers/transactions-provider';
import { ChevronRight, Space, Underline } from 'lucide-react';
import { useGoose } from '@/components/providers/goose-provider';

export default function Home() {
  // GOOSE
  const gooseRef = useGoose();
  const [isGooseHappy, setIsGooseHappy] = useState(false);
  const regularNeckLength = 200;
  const [neckLength, setNeckLength] = useState(regularNeckLength);
  // TRANSACTION ANALYSIS
  const { transactions } = useTransactions();
  const totalSpent = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  // SLIDES
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    // SLIDE 1
    {
      title: (
        <h1 className="text-5xl sm:text-7xl md:text-8xl  max-w-full flex flex-wrap font-bold "> 
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
      content: (
        <div className='w-full flex flex-col space-y-2'>
          <div className="bg-amber-50 p-4 rounded-lg">
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div>
                    <p>Sign in to the                      
                      <a className="text-yellow-400 " href="https://secure.touchnet.net/C22566_oneweb/"> WatCard portal</a>
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div>
                    <p>Grab your transactions:</p>
                    <ul className="mt-2 ml-6 space-y-2 text-gray-600">
                      <li>Hit "Transaction History"</li>
                      <li>Set start date to Sept 1</li>
                      <li>Click "View History"</li>
                      <li>Change to 100 entries</li>
                      <li>Select all & copy (CMD/CTRL + A, then C)</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start flex-col">
                  <p>Drop it below 👇</p>                  
                  <TransactionImporter/>
                </li>
              </ol>
            </div>
          
        </div>
      ),
      buttonText: "Analyze it!"
    },
    // SLIDE 3
    {
      content: (
        <div className='w-full p-3 aspect-square rounded-2xl items-center flex  '>
          <p className="text-5xl">
            You ate <br />
            <em> <strong> ${totalSpent.toFixed(2)}  </strong> </em> <br />
            worth of food.
          </p>
        </div>
      ),
      buttonText: ""
    }
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  // PAGE
  return (
    <div className="h-screen bg-amber-100 flex items-center overflow-hidden">
      {/* Left half - Text content */}
      <div className="w-1/2 overflow-hidden relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentSlide * 100}%)`,
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
                className="w-fit sm:text-2xl px-4 py-1 bg-yellow-400 rounded-md hover:rotate-2 hover:scale-110 transition-all disabled:bg-yellow-400/40 disabled:cursor-not-allowed"
                onMouseEnter={() => {
                  setIsGooseHappy(true);
                  setNeckLength(regularNeckLength * 1.2);
                }}
                onMouseLeave={() => {
                  setIsGooseHappy(false);
                  setNeckLength(regularNeckLength);
                }}
                onClick={handleNextSlide}
                disabled={index === 1}
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
            <GooseHead
              ref={gooseRef}
              size={250}
              isHappy={isGooseHappy}
              maxDistance={neckLength}
              mode="FOLLOW"
              speech=''
            />
          </div>
          {/* <div className="relative w-full aspect-[5/3]"/> */}
          <WatCard />
        </div>
      </div>
    </div>
  );
}