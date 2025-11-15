import { useChat } from "@/contexts/ChatContextProvider";
import { ChannelListItem } from "./ChannelListItem";
import { CreateChannelModal } from "./CreateChannelModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Hash } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export function ChannelList() {
  const { channels, selectedChannel, selectChannel, isLoading } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  // Filter channels based on search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;

    const query = searchQuery.toLowerCase();
    return channels.filter(
      channel =>
        channel.name.toLowerCase().includes(query) ||
        channel.description?.toLowerCase().includes(query) ||
        channel.lastMessage?.text?.toLowerCase().includes(query)
    );
  }, [channels, searchQuery]);

  // Separate group and direct channels
  const groupChannels = filteredChannels.filter(
    channel => channel.type === "group"
  );
  const directChannels = filteredChannels.filter(
    channel => channel.type === "direct"
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Channels</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => setIsCreateChannelOpen(true)}
        >
          <Hash className="w-4 h-4 mr-2" />
          Create Channel
        </Button>
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
              {searchQuery ? "No channels found" : "No channels yet"}
            </div>
          ) : (
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
