import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  /** Loading message to display */
  message?: string;
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show full screen overlay */
  fullScreen?: boolean;
  /** Whether to center the content */
  centered?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingIndicator({
  message = "Loading...",
  size = "md",
  className,
  fullScreen = false,
  centered = true,
}: LoadingIndicatorProps) {
  const containerClasses = cn(
    "flex items-center justify-center",
    {
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50": fullScreen,
      "py-12": !fullScreen && centered,
      "py-4": !fullScreen && !centered,
    },
    className
  );

  const contentClasses = cn("flex flex-col items-center space-y-4", {
    "text-center": centered,
  });

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <Loader2
          className={cn("animate-spin text-primary", sizeClasses[size])}
        />
        {message && (
          <p
            className={cn("text-muted-foreground", {
              "text-sm": size === "sm",
              "text-base": size === "md",
              "text-lg": size === "lg",
            })}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function LoadingSpinner({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
    />
  );
}

export function LoadingOverlay({
  message = "Loading...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <LoadingIndicator message={message} fullScreen className={className} />
  );
}

export function InlineLoading({
  message = "Loading...",
  size = "sm",
  className,
}: {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}
