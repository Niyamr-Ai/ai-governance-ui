import { cn } from "@/utils/shared-utils";
import { type ReactNode, type ButtonHTMLAttributes } from 'react';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-blue',
  hero: 'bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-accent hover:scale-105',
  'hero-outline': 'border-2 border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/5',
  ghost: 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
  outline: 'border border-border text-foreground hover:bg-secondary/50',
} as const;

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-11 px-8',
  xl: 'h-12 px-10 text-lg',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}