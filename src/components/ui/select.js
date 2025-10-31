import React from 'react';
import { cn } from '../../lib/utils';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-600 dark:bg-blue-900/50 dark:ring-offset-gray-950 dark:focus:ring-blue-400 dark:text-white',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Select };