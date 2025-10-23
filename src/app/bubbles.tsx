"use client";

import { useState, useEffect } from 'react';

const Bubbles = () => {
  const [bubbles, setBubbles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const bubbleSizes = ['w-4 h-4', 'w-8 h-8', 'w-3 h-3', 'w-6 h-6', 'w-5 h-5', 'w-7 h-7', 'w-2 h-2', 'w-4 h-4', 'w-5 h-5', 'w-8 h-8'];
    const animationDetails = [
      { duration: '18s', delay: '0s' }, { duration: '12s', delay: '1s' }, { duration: '15s', delay: '2s' },
      { duration: '20s', delay: '0s' }, { duration: '22s', delay: '3s' }, { duration: '18s', delay: '1s' },
      { duration: '16s', delay: '4s' }, { duration: '13s', delay: '2s' }, { duration: '19s', delay: '0s' },
      { duration: '14s', delay: '3s' }
    ];

    setBubbles(Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className={`absolute bottom-[-150px] bg-white/10 rounded-full animate-float-bubbles ${bubbleSizes[i % bubbleSizes.length]}`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: animationDetails[i % animationDetails.length].duration,
          animationDelay: animationDetails[i % animationDetails.length].delay,
        }}
      />
    )));
  }, []);

  return <div className="absolute top-0 left-0 w-full h-full z-[1]">{bubbles}</div>;
};

export default Bubbles;
