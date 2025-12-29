
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center group`}>
      {/* Outer Glow Effect */}
      <div className="absolute inset-0 bg-white/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>
        </defs>
        
        {/* Main Geometric Body */}
        <path 
          d="M30 25C30 25 70 20 70 45C70 70 30 70 30 55C30 40 70 35 70 35" 
          stroke="url(#logo-grad)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Precision Point */}
        <circle 
          cx="70" 
          cy="35" 
          r="6" 
          fill="white" 
          className="animate-pulse"
        />
        
        {/* Underline for balance */}
        <rect x="30" y="80" width="40" height="4" rx="2" fill="white" fillOpacity="0.2" />
      </svg>
    </div>
  );
};

export default Logo;
