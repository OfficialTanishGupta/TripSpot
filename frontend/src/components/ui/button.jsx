import { cn } from '../../lib/utils';

const VARIANTS = {
  primary: 'bg-violet text-white hover:brightness-110 shadow-lg shadow-violet/25',
  outline: 'border border-line text-mist hover:text-ink hover:border-mist-soft bg-transparent',
  ghost: 'bg-transparent text-mist hover:text-ink hover:bg-black/[0.04]',
  accent: 'text-ink font-semibold hover:brightness-110 shadow-lg',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
};

export function Button({ className, variant = 'primary', size = 'md', accentColor, style, children, ...props }) {
  const accentStyle = variant === 'accent' && accentColor ? { background: accentColor, ...style } : style;
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      style={accentStyle}
      {...props}
    >
      {children}
    </button>
  );
}