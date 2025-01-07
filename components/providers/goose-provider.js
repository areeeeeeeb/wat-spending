'use client';
import { createContext, useContext, useRef } from 'react';

const GooseContext = createContext();

export function GooseProvider({ children }) {
  const gooseRef = useRef();

  return (
    <GooseContext.Provider value={gooseRef}>
      {children}
    </GooseContext.Provider>
  );
}

export function useGoose() {
  const context = useContext(GooseContext);
  if (context === undefined) {
    throw new Error('useGoose must be used within a GooseProvider');
  }
  return context;
}