import { Button } from "@/components/ui/button";
import { SmilePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MessageReaction as MessageReactionType } from "@/schemaTypes/chatSchemaTypes";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
  reactions: MessageReactionType[];
  onReactionClick: (reaction: string) => void;
  showSmiley?: boolean;
  showCommonReactions?: boolean;
}

const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const moreReactions = [
  "🎉",
  "🔥",
  "💯",
  "👏",
  "😍",
  "🤔",
  "😊",
  "👌",
  "🙌",
  "💪",
  "😎",
  "🤗",
  "😊",
  "👌",
  "🙌",
  "💪",
  "😎",
  "🤗",
];

export function MessageReactions({
  reactions,
  onReactionClick,
  showSmiley = true,
  showCommonReactions = false,
}: MessageReactionsProps) {
  // Group reactions by reaction
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
    <div
      className={cn(
        "flex items-center gap-1",
        showCommonReactions ? "mt-0" : "mt-2 flex-wrap"
      )}
    >
      {/* Show common reactions if enabled */}
      {showCommonReactions && (
        <>
          {commonReactions.map(reaction => (
            <Button
              key={reaction}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-lg hover:bg-muted transition-colors rounded-md"
              onClick={() => onReactionClick(reaction)}
            >
              {reaction}
            </Button>
          ))}
        </>
      )}

      {/* Show existing reaction groups */}
      {!showCommonReactions &&
        Object.entries(reactionGroups).map(([reaction, reactionList]) => (
          <Button
            key={reaction}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-sm rounded-full border-border hover:bg-muted"
            onClick={() => onReactionClick(reaction)}
          >
            {reaction} {reactionList.length}
          </Button>
        ))}

      {showSmiley && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 rounded-full border-border hover:bg-muted"
            >
              <SmilePlus className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-6 gap-1">
              {[...commonReactions, ...moreReactions].map(reaction => (
                <Button
                  key={reaction}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-muted transition-colors"
                  onClick={() => onReactionClick(reaction)}
                >
                  {reaction}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
