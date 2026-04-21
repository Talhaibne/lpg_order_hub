import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  containerClassName?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, containerClassName, label, error, id, type = "text", placeholder, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id || reactId;
    return (
      <div className={cn("relative", containerClassName)}>
        <input
          id={inputId}
          ref={ref}
          type={type}
          placeholder={placeholder ?? " "}
          className={cn(
            "peer flex h-10 w-full rounded-md border border-input bg-background px-3 pt-3 pb-1 text-sm text-foreground ring-offset-background transition-colors",
            "placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 origin-[0] bg-background px-1 text-sm text-muted-foreground transition-all duration-150",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-primary",
            "peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs",
            "peer-disabled:opacity-50",
            error && "text-destructive peer-focus:text-destructive",
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: boolean;
  containerClassName?: string;
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, containerClassName, label, error, id, placeholder, rows = 3, ...props }, ref) => {
    const reactId = React.useId();
    const inputId = id || reactId;
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          placeholder={placeholder ?? " "}
          className={cn(
            "peer flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 pt-5 pb-2 text-sm text-foreground ring-offset-background transition-colors",
            "placeholder:text-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 top-3 origin-[0] bg-background px-1 text-sm text-muted-foreground transition-all duration-150",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-primary",
            "peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs",
            "peer-disabled:opacity-50",
            error && "text-destructive peer-focus:text-destructive",
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);
FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingInput, FloatingTextarea };
