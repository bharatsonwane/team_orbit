import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { useChat } from "@/contexts/ChatContextProvider";
import type { Conversation, ChatChannel } from "@/schemas/chat";

interface ChatMessageInputProps {
  conversation?: Conversation;
  channel?: ChatChannel;
}

export function ChatMessageInput({
  conversation,
  channel,
}: ChatMessageInputProps) {
  const { sendMessage, setTyping } = useChat();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const channelId = conversation?.channelId || channel?.id;
  if (!channelId) return null;

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      setTyping(channelId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(channelId, false);
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, channelId, setTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage({
      channelId: channelId,
      text: message.trim(),
    });

    setMessage("");
    setIsTyping(false);
    setTyping(channelId, false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none pr-10"
            rows={1}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 h-7 w-7"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
