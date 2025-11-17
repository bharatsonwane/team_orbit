import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video, Hash, Lock, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatChannel } from "@/schemas/chatSchema";
import { Badge } from "@/components/ui/badge";
import { dummyChatUsers } from "@/utils/dummyChat";

interface ChatHeaderProps {
  channel: ChatChannel;
  channelType: "group" | "direct";
}

export function ChatHeader({ channel, channelType }: ChatHeaderProps) {
  if (channelType === "direct" && channel) {
    // For direct chats, find the other participant
    // This is a temporary solution - in a real app, you'd get this from the channel metadata
    const participant = dummyChatUsers.find(
      user => user.id !== channel.id && channel.name.includes(user.name)
    ) || {
      id: 0,
      name: channel.name,
      email: "",
      status: "offline" as const,
    };

    return (
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={channel.avatar || participant.avatar}
              alt={participant.name}
            />
            <AvatarFallback>
              {participant.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm truncate">
                {participant.name}
              </h2>
              {participant.status === "online" && (
                <Badge variant="outline" className="h-4 px-1.5 text-xs">
                  Online
                </Badge>
              )}
            </div>
            {participant.status !== "online" && participant.lastSeen && (
              <p className="text-xs text-muted-foreground">
                Last seen {new Date(participant.lastSeen).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  if (channelType === "group" && channel) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="w-10 h-10">
            {channel.avatar ? (
              <AvatarImage src={channel.avatar} alt={channel.name} />
            ) : (
              <AvatarFallback className="bg-muted">
                {channel.type === "direct" ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Hash className="w-5 h-5 text-muted-foreground" />
                )}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm truncate">
                #{channel.name}
              </h2>
              {channel.type === "direct" && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {channel.memberCount}{" "}
                {channel.memberCount === 1 ? "member" : "members"}
              </p>
              {channel.description && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground truncate">
                    {channel.description}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Users className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Channel Info</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuItem>Members</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Leave Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return null;
}
