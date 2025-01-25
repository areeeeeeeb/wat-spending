'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
const TransactionsContext = createContext(null);
import { saveAs } from 'file-saver';

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  const updateTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
  }, []);

  const downloadCSV = useCallback(() => {
    if (!transactions.length) return;
    const csvContent = [
      // CSV Header matching transaction row format
      ['DATE-TIME', 'TYPE', 'TERMINAL', 'STATUS', 'BALANCE', 'UNITS', 'AMOUNT'].join(','),
      // Transaction rows
      ...transactions.map(tx => [
        tx.dateTime || '',
        tx.type || '',
        tx.terminal || '',
        tx.status || '',
        tx.balance || '',
        tx.units || '',
        tx.amount || ''
      ].map(value => `"${value}"`).join(','))
    ].join('\n');
    // Create and trigger CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transactions.csv');
  }, [transactions]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter(tx => 
        tx.amount < 0 &&
        tx.amount > -100
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  const getLongestSpendingStreak = useMemo(() => {
    let longestStreak = 0;
    let currentStreak = 0;
    let longestStreakStart = null;
    let longestStreakEnd = null;
    let currentStreakStart = null;
    let lastDate = null;
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
   
    sortedTransactions.forEach(tx => {
      if (tx.amount < 0) { // Spending transaction
        const currentDate = new Date(tx.dateTime);
        currentDate.setHours(0, 0, 0, 0);
        if (lastDate) {
          lastDate.setHours(0, 0, 0, 0);
          const timeDiff = currentDate - lastDate;
          const daysBetween = timeDiff / (1000 * 60 * 60 * 24);
          if (daysBetween === 1) {
            currentStreak++;
          } else if (daysBetween > 1) {
            currentStreak = 1;
            currentStreakStart = tx.dateTime;
          }
        } else {
          currentStreak = 1;
          currentStreakStart = tx.dateTime;
        }
        // Update longest streak
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakStart = currentStreakStart;
          longestStreakEnd = tx.dateTime;
        }
      } else {
        currentStreak = 0;
      }
      lastDate = tx.dateTime;
    });
    return {
      streakLength: longestStreak,
      startDate: longestStreakStart,
      endDate: longestStreakEnd
    };
   }, [transactions]);

  return (
    <TransactionsContext.Provider 
      value={{ 
        transactions,
        downloadCSV,
        updateTransactions, 
        totalSpent,
        getLongestSpendingStreak
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};