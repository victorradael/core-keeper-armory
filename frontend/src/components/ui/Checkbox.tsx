import React, { useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id: providedId, ...props }, ref) => {
    const internalId = useId();
    const id = providedId || internalId;

    return (
      <div className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            className={cn(
              "peer h-6 w-6 appearance-none rounded-md border-2 border-[#938F99] bg-transparent transition-all",
              "checked:bg-primary checked:border-primary",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              className
            )}
            {...props}
          />
          <Check 
            className={cn(
              "absolute h-4 w-4 text-[#1C1B1F] scale-0 transition-transform pointer-events-none",
              "peer-checked:scale-100"
            )} 
          />
        </div>
        {label && (
          <label 
            htmlFor={id} 
            className="text-[#E6E1E5] font-medium cursor-pointer select-none group-hover:text-primary transition-colors"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
