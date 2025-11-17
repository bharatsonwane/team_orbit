import { useChat } from "@/contexts/ChatContextProvider";
import { ChannelListItem } from "./ChannelListItem";
import { CreateChannelModal } from "./CreateChannelModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Hash } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface ChannelListProps {
  channelType?: "group" | "direct";
}

export function ChannelList({ channelType }: ChannelListProps) {
  const { channels, selectedChannel, selectChannel, isLoading } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  // Filter channels based on channelType and search query
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by channelType if provided
    if (channelType) {
      filtered = filtered.filter(channel => channel.type === channelType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        channel =>
          channel.name.toLowerCase().includes(query) ||
          channel.description?.toLowerCase().includes(query) ||
          channel.lastMessage?.text?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [channels, channelType, searchQuery]);

  // Separate group and direct channels (only if channelType is not specified)
  const groupChannels = useMemo(() => {
    if (channelType) return [];
    return filteredChannels.filter(channel => channel.type === "group");
  }, [filteredChannels, channelType]);

  const directChannels = useMemo(() => {
    if (channelType) return [];
    return filteredChannels.filter(channel => channel.type === "direct");
  }, [filteredChannels, channelType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">
          {channelType === "direct" ? "Direct Messages" : "Channels"}
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              channelType === "direct"
                ? "Search conversations..."
                : "Search channels..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {channelType !== "direct" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsCreateChannelOpen(true)}
          >
            <Hash className="w-4 h-4 mr-2" />
            Create Channel
          </Button>
        )}
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading channels...
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery
                ? `No ${channelType === "direct" ? "conversations" : "channels"} found`
                : `No ${channelType === "direct" ? "conversations" : "channels"} yet`}
            </div>
          ) : channelType ? (
            // Show filtered channels when channelType is specified
            filteredChannels.map(channel => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isSelected={selectedChannel?.id === channel.id}
                onClick={() => selectChannel(channel)}
              />
            ))
          ) : (
            // Show separated group and direct channels when channelType is not specified
            <>
              {/* Group Channels */}
              {groupChannels.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Group Channels
                  </div>
                  {groupChannels.map(channel => (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      isSelected={selectedChannel?.id === channel.id}
                      onClick={() => selectChannel(channel)}
                    />
                  ))}
                </div>
              )}

              {/* Direct Channels */}
              {directChannels.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Direct Channels
                  </div>
                  {directChannels.map(channel => (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      isSelected={selectedChannel?.id === channel.id}
                      onClick={() => selectChannel(channel)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <CreateChannelModal
        open={isCreateChannelOpen}
        onOpenChange={setIsCreateChannelOpen}
      />
    </div>
  );
}
