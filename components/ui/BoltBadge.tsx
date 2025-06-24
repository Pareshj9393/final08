'use client';

import React from 'react';

export default function BoltBadge() {
  return (
    // Adjusted top margin for the smaller badge size
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <a href="https://bolt.new/?rid=os72mi" target="_blank" rel="noopener noreferrer"
         className="block transition-all duration-300 hover:scale-105 hover:shadow-xl group"
      >
        <img
          src="https://storage.bolt.army/white_circle_360x360.png"
          alt="Built with Bolt.new badge"
          // Reduced height and width for a smaller badge
          className="w-14 h-14 md:w-15 md:h-14 rounded-full shadow-lg bolt-badge bolt-badge-intro"
          onAnimationEnd={(e) => (e.target as HTMLElement).classList.add('animated')}
        />
      </a>
    </div>
  );
}