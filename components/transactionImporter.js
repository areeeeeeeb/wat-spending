'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactions } from './providers/transactions-provider';

export default function TransactionImporter() {
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { transactions, updateTransactions, downloadCSV } = useTransactions();

  const parseTransactions = (text) => {
    try {
      const lines = text.split('\n');
      const dataStartIndex = lines.findIndex(line => line.includes('Date - Time'));
      
      if (dataStartIndex === -1) {
        throw new Error('Could not find transaction data. Please copy the entire transaction table from WatCard.');
      }

      const parsedTransactions = lines.slice(dataStartIndex + 1)
        .filter(line => line.match(/^\d{4}-\d{2}-\d{2}/))
        .map(line => {
          const parts = line.split(/(?<=\d)\s+(?=\d{3}\s+:|[A-Z]+\s+\()|(?<=\))\s+(?=\d{5}\s+:|[A-Z]+[-\w]+)|(?<=:)\s+(?=[A-Z]+[-\w]+)|(?<=\w)\s+(?=Approved)|(?<=Approved)\s+(?=\d+)|(?<=\d)\s+(?=\$)/).filter(Boolean);
          
          const [dateTime, type, terminal, status, balance, units, amount] = parts;
          
          return {
            dateTime,
            type: type.split(' : ')[1] || type,
            location: terminal.split(' : ')[1] || terminal,
            status,
            balance: parseInt(balance),
            amount: parseFloat(amount.replace('$', ''))
          };
        });

      if (parsedTransactions.length === 0) {
        throw new Error('No valid transactions found. Please make sure to copy the entire table.');
      }

      updateTransactions(parsedTransactions);
      setError(null);
    } catch (e) {
      setError(e.message);
      updateTransactions([]);
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text');
    parseTransactions(text);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      parseTransactions(event.target.result);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-12
          flex flex-col items-center justify-center space-y-4
          transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${error ? 'border-red-300' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Import Your WatCard Transactions</h3>
          <p className="text-gray-500">
            Copy and paste your transaction history or drop a text file
          </p>
          <div className="text-sm text-gray-400">
            1. Select all (Cmd/Ctrl + A) on the WatCard transaction page<br />
            2. Copy (Cmd/Ctrl + C)<br />
            3. Paste here (Cmd/Ctrl + V)
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {transactions.length > 0 && (
        <div className="flex justify-between items-center">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully imported {transactions.length} transactions
            </AlertDescription>
          </Alert>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}