import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
// import type { UseFormRegister, FieldValues } from 'react-hook-form';

interface BaseInputWithLabelProps {
  /** Unique identifier for the input */
  id: string;
  /** Label text */
  label: string;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the input */
  inputClassName?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

interface InputWithLabelProps extends BaseInputWithLabelProps {
  /** Input type */
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  /** Placeholder text */
  placeholder?: string;
  /** Maximum length for the input */
  maxLength?: number;
  /** Minimum length for the input */
  minLength?: number;
  /** Register function from react-hook-form */
  register?: any;
  /** Input variant */
  variant?: "input";
}

interface TextareaWithLabelProps extends BaseInputWithLabelProps {
  /** Placeholder text */
  placeholder?: string;
  /** Number of rows for the textarea */
  rows?: number;
  /** Maximum length for the textarea */
  maxLength?: number;
  /** Register function from react-hook-form */
  register?: any;
  /** Input variant */
  variant: "textarea";
}

type InputWithLabelComponentProps =
  | InputWithLabelProps
  | TextareaWithLabelProps;

export const InputWithLabel = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputWithLabelComponentProps
>(props => {
  const {
    id,
    label,
    required = false,
    error,
    helperText,
    className,
    inputClassName,
    disabled = false,
    register,
    ...restProps
  } = props;

  const isTextarea = "variant" in restProps && restProps.variant === "textarea";

  const containerClasses = cn("space-y-2", className);

  const labelClasses = cn(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  );

  const inputClasses = cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    inputClassName
  );

  const textareaClasses = cn(
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    inputClassName
  );

  const errorClasses = "text-sm text-destructive";
  const helperClasses = "text-xs text-muted-foreground";

  return (
    <div className={containerClasses}>
      <Label htmlFor={id} className={labelClasses}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {isTextarea ? (
        <Textarea
          id={id}
          className={textareaClasses}
          disabled={disabled}
          {...(register ? register(id) : {})}
          {...restProps}
        />
      ) : (
        <Input
          id={id}
          className={inputClasses}
          disabled={disabled}
          {...(register ? register(id) : {})}
          {...restProps}
        />
      )}

      {error && <p className={errorClasses}>{error}</p>}

      {helperText && !error && <p className={helperClasses}>{helperText}</p>}
    </div>
  );
});

InputWithLabel.displayName = "InputWithLabel";

// Select component with label
interface SelectWithLabelProps extends BaseInputWithLabelProps {
  /** Register function from react-hook-form */
  register?: any;
  /** Select options */
  children: React.ReactNode;
}

export const SelectWithLabel = forwardRef<
  HTMLSelectElement,
  SelectWithLabelProps
>(
  ({
    id,
    label,
    required = false,
    error,
    helperText,
    className,
    inputClassName,
    disabled = false,
    register,
    children,
    ...props
  }) => {
    const containerClasses = cn("space-y-2", className);
    const labelClasses = cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    );
    const selectClasses = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      inputClassName
    );
    const errorClasses = "text-sm text-destructive";
    const helperClasses = "text-xs text-muted-foreground";

    return (
      <div className={containerClasses}>
        <Label htmlFor={id} className={labelClasses}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        <select
          id={id}
          className={selectClasses}
          disabled={disabled}
          {...(register ? register(id) : {})}
          {...props}
        >
          {children}
        </select>

        {error && <p className={errorClasses}>{error}</p>}

        {helperText && !error && <p className={helperClasses}>{helperText}</p>}
      </div>
    );
  }
);

SelectWithLabel.displayName = "SelectWithLabel";
