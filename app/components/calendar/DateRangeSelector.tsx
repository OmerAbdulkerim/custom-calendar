'use client';

import React from 'react';

type DateRangeOption = '1-day' | '7-day' | '30-day';

interface DateRangeSelectorProps {
  selectedRange: DateRangeOption;
  onChange: (range: DateRangeOption) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  selectedRange, 
  onChange 
}) => {
  return (
    <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
      <button
        onClick={() => onChange('1-day')}
        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
          selectedRange === '1-day'
            ? 'bg-indigo-500 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        1 Day
      </button>
      <button
        onClick={() => onChange('7-day')}
        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
          selectedRange === '7-day'
            ? 'bg-indigo-500 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        7 Days
      </button>
      <button
        onClick={() => onChange('30-day')}
        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
          selectedRange === '30-day'
            ? 'bg-indigo-500 text-white' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
      >
        30 Days
      </button>
    </div>
  );
};

export default DateRangeSelector;
