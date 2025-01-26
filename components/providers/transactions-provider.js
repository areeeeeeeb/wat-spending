'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
const TransactionsContext = createContext(null);
import { saveAs } from 'file-saver';

export function TransactionsProvider({ children }) {
  // SETTING AND UPDATING TRANSACTIONS
  const [transactions, setTransactions] = useState([]);
  const updateTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
  }, []);

  // CSV
  const downloadCSV = useCallback(() => {
    if (!transactions.length) return;
    const csvContent = [
      // CSV Header matching transaction row format
      ['DATE-TIME', 'TYPE', 'TERMINAL', 'STATUS', 'BALANCE', 'UNITS', 'AMOUNT'].join(','),
      // Transaction rows
      ...transactions.map(tx => [
        tx.dateTime || '', tx.type || '', tx.terminal || '', tx.status || '', tx.balance || '', tx.units || '', tx.amount || ''
      ].map(value => `"${value}"`).join(','))
    ].join('\n');
    // Create and trigger CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transactions.csv');
  }, [transactions]);

  // GET TOTAL SPENT
  const totalSpent = useMemo(() => {
    return transactions
      .filter(tx => 
        tx.amount < 0 &&
        tx.type != "003 : PREPAYMENT (ADMIN)" &&
        tx.type != "136 : ACCOUNT BALANCE MOVE"
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  // GET LONGEST SPENDING STREAK
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

  // GET UNIQUE TERMINALS
  const uniqueTerminals = useMemo(() => {
    const terminals = transactions.map(tx => tx.terminal).filter(Boolean); // Filter out any undefined or null values
    return new Set(terminals).size;
  }, [transactions]);

  // GET MOST COMMON TERMINAL
  const mostCommonTerminal = useMemo(() => {
    const terminalCounts = transactions.reduce((counts, tx) => {
      if (tx.terminal) {
        counts[tx.terminal] = (counts[tx.terminal] || 0) + 1;
      }
      return counts;
    }, {});
    return Object.entries(terminalCounts).reduce(
      (mostCommon, [terminal, count]) => (count > mostCommon.count ? { terminal, count } : mostCommon),
      { terminal: null, count: 0 }
    );
  }, [transactions]);

  return (
    <TransactionsContext.Provider 
      value={{ 
        transactions,
        downloadCSV,
        updateTransactions,
        getLongestSpendingStreak,
        totalSpent,
        uniqueTerminals,
        mostCommonTerminal
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