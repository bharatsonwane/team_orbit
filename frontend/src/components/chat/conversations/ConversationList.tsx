import { useChat } from "@/contexts/ChatContextProvider";
import { ConversationListItem } from "./ConversationListItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export function ConversationList() {
  const { conversations, selectedConversation, selectConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(
      conv =>
        conv.participant.name.toLowerCase().includes(query) ||
        conv.participant.email.toLowerCase().includes(query) ||
        conv.lastMessage?.text?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
