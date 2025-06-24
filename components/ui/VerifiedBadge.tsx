// components/ui/VerifiedBadge.tsx
'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export const VerifiedBadge = ({ className, size = 16 }: VerifiedBadgeProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px',
          backgroundColor: '#2563eb', // A blue color
          color: 'white'
        }}
        title="Verified"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    );
  }

  return (
    <img
      src="https://static.vecteezy.com/system/resources/previews/012/528/256/original/verified-icon-illustration-guaranteed-stamp-or-verified-badge-trendy-design-vector.jpg"
      alt="Verified User Badge"
      title="Verified"
      width={size}
      height={size}
      className={cn('inline-block rounded-full', className)}
      style={{
        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
      }}
      onError={() => setHasError(true)}
    />
  );
};
