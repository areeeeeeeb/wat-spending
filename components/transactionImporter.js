'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTransactions } from './providers/transactions-provider';

import { useGoose } from '@/components/providers/goose-provider';

export default function TransactionImporter() {
  const gooseRef = useGoose();
  const [textValue, setTextValue] = useState('');
  const textAreaRef = useRef(null);
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
          const parts = line.split(/(?<=\d)\s+(?=\d{3}\s+:|[A-Z]+\s+\()|(?<=\))\s+(?=\d{5}\s+:|[A-Z]+[-\w]+)|(?<=:)\s+(?=\d{5}\s+:|[A-Z]+[-\w]+)|(?<=\w)\s+(?=Approved)|(?<=Approved)\s+(?=\d+)|(?<=\d)\s+(?=\$)/).filter(Boolean);
          
          // Safely extract values with default values if undefined
          const [dateTime = '', type = '', terminal = '', status = '', balance = '0', units = '', amount = '$0'] = parts;
          
          return {
            dateTime,
            type: type.split(' : ')[1] || type,
            location: terminal.split(' : ')[1] || terminal,
            status,
            balance: parseInt(balance) || 0,
            // Safely handle amount parsing with fallback to 0
            amount: parseFloat((amount || '$0').replace(/[^\d.-]/g, '')) || 0
          };
        });

      if (parsedTransactions.length === 0) {
        throw new Error('No valid transactions found. Please make sure to copy the entire table.');
      }

      updateTransactions(parsedTransactions);
      setError(null);
      handleSlide();
      gooseRef.current.eat(textAreaRef.current);
    } catch (e) {
      setError(e.message);
      updateTransactions([]);
    }
  };

  const handlePaste = (e) => {
    setTextValue(e.clipboardData.getData('Text'));
    const text = e.clipboardData.getData('text');
    parseTransactions(text);
  };

  const handleChange = (e) => {
    setTextValue(e.target.value);
    parseTransactions(textValue);
  };

  const [slide, setSlide] = useState(false);
  
  const handleSlide = () => {
    setTimeout(() => {
      setSlide(true);
      setTimeout(() => {
        setSlide(false);
        setTextValue('');
      }, 1000);
    }, 1000);
  };


  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-12 overflow-hidden">
        <textarea
          ref={textAreaRef}
          className={`
            w-full h-full
            border-2 border-dashed rounded-lg
            resize-none
            p-2 text-sm leading-none
            focus:outline-none
            transition-colors
            text-transparent caret-black
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${error ? 'border-red-300' : ''}
          `}
          onPaste={handlePaste}
          onChange={handleChange}
          value={textValue.replace(/\s+/g, '')}
          tabIndex={0}
        />
        <div className="absolute top-0 left-0  text-sm leading-none w-full h-full p-2 pointer-events-none overflow-hidden">
          <span
            className={`inline-block transition-transform duration-1000 whitespace-pre-wrap text-black
              ${slide ? 'translate-x-full' : 'translate-x-0'}`}
          >
            {textValue.replace(/\s+/g, '')}
          </span>
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
        </div>
      )}
    </div>
  );
}