import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ChatEmptyState({
  title = "No conversation selected",
  description = "Select a conversation from the list to start chatting.",
  className,
}: ChatEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full text-center p-8",
        className
      )}
    >
      <div className="mb-4 p-6 rounded-full bg-muted">
        <MessageSquare className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}
