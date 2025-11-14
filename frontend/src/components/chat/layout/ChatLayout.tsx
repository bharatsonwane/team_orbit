import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  sidebar: ReactNode;
  mainContent: ReactNode;
}

export function ChatLayout({ sidebar, mainContent }: ChatLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card">{sidebar}</div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">{mainContent}</div>
    </div>
  );
}
