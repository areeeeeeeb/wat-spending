'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

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

  return (
    <TransactionsContext.Provider 
      value={{ 
        transactions, 
        csvContent, 
        updateTransactions, 
        downloadCSV 
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