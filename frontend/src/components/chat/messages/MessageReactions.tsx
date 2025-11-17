import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MessageReaction as MessageReactionType } from "@/schemas/chatSchema";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  reactions: MessageReactionType[];
  onReactionClick: (reaction: string) => void;
}

const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function MessageReactions({
  reactions,
  onReactionClick,
}: MessageReactionsProps) {
  // Group reactions by emoji
  const reactionGroups = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.reaction]) {
        acc[reaction.reaction] = [];
      }
      acc[reaction.reaction].push(reaction);
      return acc;
    },
    {} as Record<string, MessageReactionType[]>
  );

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {Object.entries(reactionGroups).map(([emoji, reactionList]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onReactionClick(emoji)}
        >
          {emoji} {reactionList.length}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <SmilePlus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {commonReactions.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg"
                onClick={() => onReactionClick(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
