import React, { useId } from 'react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, className, id: providedId, ...props }, ref) => {
    const internalId = useId();
    const id = providedId || internalId;

    return (
      <div className="flex flex-col gap-1 w-full group">
        <div className="relative">
          <input
            id={id}
            ref={ref}
            className={cn(
              "peer w-full bg-transparent px-4 py-3 rounded-xl border border-[#938F99] text-[#E6E1E5]",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
              "placeholder:text-transparent transition-all",
              error && "border-error focus:border-error focus:ring-error",
              className
            )}
            placeholder={label}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "absolute left-4 -top-2 px-1 bg-[#1C1B1F] text-xs text-[#938F99] transition-all",
              "peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:px-0 peer-placeholder-shown:bg-transparent",
              "peer-focus:-top-2 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-[#1C1B1F] peer-focus:text-primary",
              error && "text-error peer-focus:text-error"
            )}
          >
            {label}
          </label>
        </div>
        {error ? (
          <span className="text-xs text-error px-1">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#938F99] px-1">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
