'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const TransactionsContext = createContext(null);

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [csvContent, setCsvContent] = useState(null);

  const generateCSV = useCallback((data) => {
    const headers = ['Date & Time', 'Location', 'Type', 'Amount', 'Balance', 'Status'];
    const csvRows = [
      headers.join(','),
      ...data.map(tx => [
        tx.dateTime,
        `"${tx.location.replace(/"/g, '""')}"`,
        `"${tx.type.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        tx.balance.toFixed(2),
        tx.status
      ].join(','))
    ];
    return csvRows.join('\n');
  }, []);

  const updateTransactions = useCallback((newTransactions) => {
    setTransactions(newTransactions);
    const newCsvContent = generateCSV(newTransactions);
    setCsvContent(newCsvContent);
  }, [generateCSV]);

  const downloadCSV = useCallback(() => {
    if (!csvContent) return;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `watcard_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [csvContent]);

  const totalSpent = useMemo(() => {
    return transactions
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  const getLongestSpendingStreak = useMemo(() => {
    const sortedTransactions = [...transactions]
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    // Get unique dates with spending
    const spendingDates = new Set(
      sortedTransactions
        .filter(tx => tx.amount >= 0)
        .map(tx => new Date(tx.dateTime).toISOString().split('T')[0])
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart = null;
    let longestStreakStart = null;
    let longestStreakEnd = null;

    // Convert Set to sorted array of dates
    const sortedDates = Array.from(spendingDates).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = i > 0 ? new Date(sortedDates[i - 1]) : null;
      // Check if this is the start of a new streak
      if (!previousDate || (currentDate - previousDate) / (1000 * 60 * 60 * 24) > 1) {
        // If we found a longer streak, update the longest streak info
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakStart = new Date(sortedDates[i - currentStreak]);
          longestStreakEnd = previousDate;
        }
        // Start new streak
        currentStreak = 1;
        currentStreakStart = currentDate;
      } else {
        // Continue current streak
        currentStreak++;
      }
    }
    // Check one last time in case the longest streak ends at the last date
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      longestStreakStart = currentStreakStart;
      longestStreakEnd = new Date(sortedDates[sortedDates.length - 1]);
    }
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
        csvContent, 
        updateTransactions, 
        downloadCSV,
        totalSpent
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