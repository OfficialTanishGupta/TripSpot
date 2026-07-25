import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface/80 backdrop-blur-sm shadow-xl shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('p-5 pb-0', className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn('p-5', className)} {...props}>{children}</div>;
}
