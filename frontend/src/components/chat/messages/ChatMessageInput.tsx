import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";
import { useChat } from "@/contexts/ChatContextProvider";
import type { ChatChannel } from "@/schemas/chatSchema";

interface ChatMessageInputProps {
  channel: ChatChannel;
}

export function ChatMessageInput({ channel }: ChatMessageInputProps) {
  const { handleSendMessage, handleSetTyping } = useChat();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chatChannelId = channel?.id;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        // Clear typing indicator when component unmounts
        if (chatChannelId) {
          handleSetTyping(chatChannelId, false);
        }
      }
    };
  }, [chatChannelId, handleSetTyping]);

  // Function to stop typing indicator
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current && chatChannelId) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      handleSetTyping(chatChannelId, false);
    }
  }, [chatChannelId, handleSetTyping]);

  // Function to start typing indicator
  const startTyping = useCallback(() => {
    if (!typingTimeoutRef.current && chatChannelId) {
      handleSetTyping(chatChannelId, true);
    }
  }, [chatChannelId, handleSetTyping]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Stop typing indicator before sending
    stopTyping();

    handleSendMessage({
      chatChannelId: chatChannelId,
      text: message.trim(),
    });

    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Only handle typing indicator if there's actual text
    if (newValue.trim().length > 0) {
      // Start typing if not already typing
      startTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
        handleSetTyping(chatChannelId, false);
      }, 3000);
    } else {
      // Stop typing if message becomes empty
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle focus - start typing indicator
  const handleFocus = () => {
    if (message.trim().length > 0) {
      startTyping();
    }
  };

  // Handle blur - stop typing indicator
  const handleBlur = () => {
    stopTyping();
  };

  if (!chatChannelId) return null;
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
