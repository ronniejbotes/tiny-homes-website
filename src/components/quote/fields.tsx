import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/* Shared form primitives for the quote page — mirrors the input styling,
   required-mark and error conventions used by the contact lead form. */

export const inputClasses =
  "h-12 w-full rounded-xl border border-border bg-cream px-4 text-base text-ink placeholder:text-stone transition-colors duration-200 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20";

export const labelClasses = "mb-2 block text-sm font-medium text-ink";

export function RequiredMark() {
  return (
    <span className="text-clay-dark" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | null | undefined;
}) {
  return (
    <p id={id} role="alert" aria-live="polite" className="mt-1.5 min-h-0 text-sm text-clay-dark">
      {message}
    </p>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  optional?: boolean;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

/** Labelled text input with error state, forwarding its ref for focus management. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    id,
    label,
    value,
    onValueChange,
    onBlur,
    error,
    required,
    optional,
    type = "text",
    autoComplete,
    inputMode,
    placeholder,
    maxLength,
    className,
  },
  ref,
) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && <RequiredMark />}
        {optional && <span className="font-normal text-stone"> (optional)</span>}
      </label>
      <input
        ref={ref}
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={placeholder}
        className={cn(inputClasses, error && "border-clay-dark")}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
});
