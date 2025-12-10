import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/contexts/ChatContextProvider";

function ChatMembers({
  channelMembers,
  onClose = () => {},
}: {
  channelMembers: any[];
  onClose: () => void;
}) {
  const { chatUsers } = useChat();

  return (
    <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-card rounded-lg shadow-lg w-64 p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members
        </h3>
        <button
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onClose()}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6l8 8M6 14L14 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {channelMembers && channelMembers.length > 0 ? (
          channelMembers.map(memberId => {
            const user = chatUsers.find(u => u.id === memberId);
            return (
              <li key={memberId} className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
                  <AvatarFallback>
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
                  <div className="font-medium text-xs truncate">
                    {user?.name || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user?.email || "No email"}
                  </div>
                </div>
                {user?.status === "online" && (
                  <Badge variant="outline" className="h-3 px-1 text-[10px]">
                    Online
                  </Badge>
                )}
              </li>
            );
          })
        ) : (
          <li className="text-muted-foreground text-xs">No members found.</li>
        )}
      </ul>
    </div>
  );
}

export default ChatMembers;
