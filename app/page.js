'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import WatCard from "@/components/watCard";
import GooseHead from "@/components/goose/gooseHead";
import TransactionImporter from '@/components/transactionImporter';
import { useTransactions } from '@/components/providers/transactions-provider';
import { ChevronRight, Space, Underline, ArrowDownToLine } from 'lucide-react';
import { useGoose } from '@/components/providers/goose-provider';
import { toPng } from 'html-to-image';
import AnalysisSlides from '@/components/analysisSlides';

export default function Home() {
  // GOOSE
  const gooseRef = useGoose();

  // PAGE
  return (
    <div className="relative w-full h-screen bg-amber-100 flex items-center mask-gradient-right overflow-hidden">
      {/* Left half - Text content */}
      <div
        className="w-full overflow-hidden relative"
      >
        <AnalysisSlides/>
      </div>
      {/* Right half - WatCard + Goose */}
      <div className="absolute left-1/2 top-1/4 sm:top-0 w-full h-full transition-all z-1 flex items-center justify-start">
        <div className="w-[200%] max-w-5xl relative ">
          <div className="absolute bottom-[5%] left-[13%] md:left-[20%] w-1/2 h-5/6 rounded-md">
            <GooseHead
              ref={gooseRef}
              size={250}
              regularNeckLength={200}
              mode="FOLLOW"
              speech=''
            />
          </div>
          <WatCard />
        </div>
      </div>
    </div>
  );
}