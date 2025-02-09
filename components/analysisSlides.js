import { useTransactions } from "./providers/transactions-provider";
import TransactionImporter from "./transactionImporter";
import { useRef, useCallback, useState } from "react";
import { useGoose } from '@/components/providers/goose-provider';

export default function AnalysisSlides() {
    const gooseRef = useGoose();

    // TRANSACTION ANALYSIS
    const { transactions, getLongestSpendingStreak, totalSpent, uniqueTerminals, mostCommonTerminal, terminalToName } = useTransactions();
    const { streakLength, startDate, endDate } = getLongestSpendingStreak;
    const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString();
    } catch (error) {
        return 'Invalid Date';
    }
    };
    
    // SLIDES
    const slideImageRef = useRef(null)
    const onImageDowloadClick = useCallback(() => {
    if (slideImageRef.current === null) {
        return
    }
    toPng(slideImageRef.current, { cacheBust: true, })
        .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'my-image-name.png'
        link.href = dataUrl
        link.click()
        })
        .catch((err) => {
        console.log(err)
        })
    }, [slideImageRef])

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
        disabled: transactions.length == 0,
        content: (
        <div className='w-full flex flex-col space-y-2'>
            <div className="py-4 rounded-lg">
                <ol className="space-y-4">
                <li className="flex items-start">
                    <div>
                    <p>
                        <span>Sign in to the </span>
                        <a className="text-yellow-400 underline italic" href="https://secure.touchnet.net/C22566_oneweb/TransactionHistory/Transactions" target="_blank">WatCard portal</a>
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
        <div className='w-full p-3 aspect-[4/3] rounded-2xl items-center flex  '>
            <p className="text-5xl">
            You ate <br />
            <em> <strong> ${totalSpent.toFixed(2)}  </strong> </em> <br />
            worth of food.
            </p>
        </div>
        ),
        buttonText: "→"
    },
    // SLIDE 4
    {
        content: (
        <div className='w-full p-3 aspect-[4/3] rounded-2xl items-center flex  '>
            <span className="text-5xl">
            Your longest spending streak was  <br />
            <em> <strong> {streakLength} days. </strong> </em> <br />
            <p className='text-xl'> {formatDate(startDate)} to {formatDate(endDate) } </p>
            </span>
        </div>
        ),
        buttonText: "→"
    },
    // SLIDE 5
    {
        content: (
        <div className='w-full p-3 aspect-[4/3] rounded-2xl items-center flex  '>
            <span className="text-5xl">
            Out of 
            <em> <strong> {uniqueTerminals} vendors </strong> </em> <br />
            One stood out.
            </span>
        </div>
        ),
        buttonText: "→"
    },
    // SLIDE 6
    {
        content: (
        <div className='w-full p-3 aspect-[4/3] rounded-2xl items-center flex  '>
            <span className="text-3xl">
            Top Vendor  <br />
            <p className='text-6xl'>
                <em> <strong> {terminalToName(mostCommonTerminal.terminal)} </strong> </em> <br />
            </p>
            <p className='text-xl'> {mostCommonTerminal.count} transactions totaling to ${Math.abs(mostCommonTerminal.sum)} </p>
            </span>
        </div>
        ),
        buttonText: "→"
    }
    ];
    
    const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
    }
    };

    return (
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentSlide * 50}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index}
              ref={index === currentSlide ? slideImageRef : null}
              className={
                `flex-shrink-0 w-1/2 flex flex-col overflow-y-scroll space-y-5 p-10 justify-center
                transition-opacity duration-500 ${index !== currentSlide ? 'opacity-0' : 'opacity-100'}`
              }
              style={{
                pointerEvents: index === currentSlide ? 'auto' : 'none', // Prevent interaction with invisible slides
              }}
            >
              {slide.title}
              {slide.content}
              <button
                className="w-fit sm:text-2xl px-4 py-1 bg-yellow-400 rounded-md hover:rotate-2 hover:scale-110 transition-all disabled:bg-yellow-400/40 disabled:cursor-not-allowed"
                onMouseEnter={() => {
                    gooseRef.current.setIsHappy(true)
                    gooseRef.current.scaleNeck(1.4);
                }}
                onMouseLeave={() => {
                    gooseRef.current.setIsHappy(false)
                    gooseRef.current.scaleNeck(1);
                }}
                onClick={handleNextSlide}
                disabled={slide.disabled}
              >
                {slide.buttonText}
              </button>
              
              {/* {index >= 2 &&
                <div className='w-full flex justify-end'>
                  <ArrowDownToLine
                    className='cursor-pointer text-black bg-gray-200 p-1 rounded-lg w-7 h-7'
                    onClick={onImageDowloadClick}
                  />
                </div>
              } */}
            </div>
          ))}
        </div>
    );
}