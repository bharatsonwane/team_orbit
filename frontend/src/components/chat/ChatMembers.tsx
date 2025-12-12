import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/ChatContextProvider";

function ChatMembers({
  channelMembers,
}: {
  channelMembers: any[];
  onClose?: () => void;
}) {
  const { chatUsers } = useChat();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Users className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 max-h-80 overflow-y-auto"
      >
        {channelMembers && channelMembers.length > 0 ? (
          channelMembers.map(memberId => {
            const user = chatUsers.find(u => u.id === memberId);
            return (
              <DropdownMenuItem
                key={memberId}
                className="flex items-center gap-3 p-3 cursor-pointer"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {user?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user?.email || "No email"}
                  </div>
                </div>
                {user?.status === "online" && (
                  <Badge
                    variant="outline"
                    className="h-4 px-2 text-[10px] bg-green-100 text-green-700 border-green-300"
                  >
                    Online
                  </Badge>
                )}
              </DropdownMenuItem>
            );
          })
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground text-sm">
            No members found.
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ChatMembers;
