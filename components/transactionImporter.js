'use client'; // Add this to enable client-side features

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TransactionImporter() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const parseTransactions = (text) => {
    try {
      // Find the start of transaction data
      const lines = text.split('\n');
      const dataStartIndex = lines.findIndex(line => line.includes('Date - Time'));
      
      if (dataStartIndex === -1) {
        throw new Error('Could not find transaction data. Please copy the entire transaction table from WatCard.');
      }

      // Skip header row and parse transactions
      const transactions = lines.slice(dataStartIndex + 1)
        .filter(line => line.match(/^\d{4}-\d{2}-\d{2}/)) // Only lines starting with dates
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

      if (transactions.length === 0) {
        throw new Error('No valid transactions found. Please make sure to copy the entire table.');
      }

      setData(transactions);
      setError(null);
    } catch (e) {
      setError(e.message);
      setData(null);
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

      {data && (
        <div className="space-y-4 overflow-y-scroll ">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Successfully imported {data.length} transactions
            </AlertDescription>
          </Alert>

          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 10).map((tx, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.dateTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${tx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">${tx.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}