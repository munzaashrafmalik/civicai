import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: string;
  delay?: number;
  className?: string;
}

export default function ScrollReveal({ children, animation = 'animate-slide-up', delay = 0, className = '' }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-smooth ${className} ${isVisible ? `${animation} opacity-100` : 'opacity-0 translate-y-6'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
