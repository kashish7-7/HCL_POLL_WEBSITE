import React, { useEffect, useState } from 'react';

const SingleDigit = ({ digit }) => {
  const num = parseInt(digit, 10) || 0;
  return (
    <div className="ticker-digit-container">
      <div 
        className="ticker-roll flex flex-col items-center"
        style={{ transform: `translateY(-${num * 2.2}rem)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[2.2rem] flex items-center justify-center font-mono text-amber-200">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
};

export const RollingTicker = ({ value = 0, label = "VOTES" }) => {
  const digits = String(value).padStart(3, '0').split('');

  return (
    <div className="inline-flex items-center gap-1 bg-[#1a1713] p-1.5 rounded border-2 border-[#8b5e34] shadow-inner">
      <div className="flex gap-0.5">
        {digits.map((d, i) => (
          <SingleDigit key={i} digit={d} />
        ))}
      </div>
      {label && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#f6ebd6] px-1 font-serif">
          {label}
        </span>
      )}
    </div>
  );
};
