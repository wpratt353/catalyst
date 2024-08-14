import clsx from 'clsx';
import { ReactNode } from 'react';

export interface Badge {
  children: ReactNode;
  className?: string;
}

export const Badge = ({ children, className = '' }: Badge) => {
  return (
    <span
      className={clsx(
        'z-10 rounded-full bg-primary-highlight px-2.5 py-[3px] font-mono text-[13px] uppercase tracking-tighter text-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
