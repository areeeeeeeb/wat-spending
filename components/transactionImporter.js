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

  const parseTransactions = async (text) => {
    try {
      const lines = text.split('\n');
      const dataStartIndex = lines.findIndex(line => line.includes('Date - Time'));
      
      if (dataStartIndex === -1) {
        throw new Error('Could not find transaction data. Please copy the entire transaction table from WatCard.');
      }

      const parsedTransactions = lines.slice(dataStartIndex + 1)
        .filter(line => line.match(/^\d{4}-\d{2}-\d{2}/))
        .map(line => {
          const parts = line.split('\t');
          const [dateTimeStr = '', type = '', terminal = '', status = '', balance = '0', units = '', amount = ''] = parts;          
          if (!amount || amount === '$0') {
            throw new Error('Amount column missing. Please widen the window and try again.');
          }
          const dateTime = new Date(dateTimeStr);
          if (isNaN(dateTime)) {
            throw new Error(`Invalid date format: ${dateTimeStr}`);
          }
          return {
            dateTime,
            type,
            terminal,
            status,
            balance,
            units,
            amount: parseFloat(amount.replace(/[^\d.-]/g, '')) || 0
          };
        });

      if (parsedTransactions.length === 0) {
        throw new Error('No valid transactions found. Please make sure to copy the entire table.');
      }

      updateTransactions(parsedTransactions);
      setError(null);
      handleSlide();
      gooseRef.current.eat(textAreaRef.current);
      await new Promise(resolve => setTimeout(resolve, 1800));
      gooseRef.current.speak(`Successfully imported ${parsedTransactions.length} transactions`, 4000);
    } catch (e) {
      setError(e.message);
      gooseRef.current.speak(`${error}`, 4000);
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
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              setTextValue('');
            }
          }}
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

      <button onClick={downloadCSV}>
          Download Transactions CSV
        </button>
    </div>
  );
}