import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/contexts/ChatContextProvider";
import { useAuthService } from "@/contexts/AuthContextProvider";
import {
  createChatChannelSchema,
  type CreateChatChannelSchema,
} from "@/schemas/chatSchema";
import { toast } from "sonner";
import type { TenantUser } from "@/schemas/userSchema";
import { getUsersAction } from "@/redux/actions/userActions";
import { createChatChannelAction } from "../../../redux/actions/chatActions";
import type { AppDispatch } from "@/redux/store";

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: CreateChatChannelSchema = {
  name: "",
  description: "",
  type: "group",
  channelUserIds: [],
};

export function CreateChannelModal({
  open,
  onOpenChange,
}: CreateChannelModalProps) {
  const { createChannel } = useChat();
  const { loggedInUser } = useAuthService();
  const dispatch = useDispatch<AppDispatch>();
  const [userList, setUserList] = useState<TenantUser[]>([]);
  const [userListLoading, setUserListLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateChatChannelSchema>({
    resolver: zodResolver(createChatChannelSchema),
    defaultValues,
  });

  useEffect(() => {
    register("channelUserIds");
  }, [register]);

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const selectedMemberIds = watch("channelUserIds") || [];

  const selectedMembers = userList.filter(user =>
    selectedMemberIds.includes(user.id)
  );

  const fetchUsers = useCallback(async () => {
    setUserListLoading(true);
    try {
      const result = await dispatch(
        getUsersAction({ page: 1, limit: 100 })
      ).unwrap();
      const filteredUsers = loggedInUser
        ? result.filter(user => user.id !== loggedInUser.id)
        : result;
      setUserList(filteredUsers);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : "Unable to load users. Please try again.";
      toast.error(message);
    } finally {
      setUserListLoading(false);
    }
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [fetchUsers, open]);

  const toggleMember = (memberId: number) => {
    const current = selectedMemberIds;
    const exists = current.includes(memberId);
    const updated = exists
      ? current.filter(id => id !== memberId)
      : [...current, memberId];
    setValue("channelUserIds", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateChatChannelSchema) => {
    const payload: CreateChatChannelSchema = {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || "",
      channelUserIds: data.channelUserIds,
      type: "group",
    };

    try {
      await dispatch(createChatChannelAction(payload)).unwrap();
      createChannel(payload);
      toast.success(`Channel #${payload.name} created`);
      onOpenChange(false);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : "Failed to create channel. Please try again.";
      toast.error(message);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-screen w-full flex flex-col p-0 sm:max-w-lg">
        <DrawerHeader className="flex-shrink-0 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Create a new channel</DrawerTitle>
              <DrawerDescription>
                Organize conversations by topic, team, or project. Adjust
                details any time later.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col min-h-0"
        >
          <input type="hidden" value="group" readOnly {...register("type")} />
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel name</Label>
              <Input
                id="channel-name"
                placeholder="e.g. product-updates"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Channel names must be unique and contain only letters, numbers,
                hyphens, or underscores.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea
                id="channel-description"
                rows={3}
                placeholder="Let everyone know what this channel is about."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Invite members</Label>
                  <p className="text-xs text-muted-foreground">
                    Select teammates to add right away.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {selectedMemberIds.length} selected
                </span>
              </div>

              <ScrollArea className="h-40 rounded-md border p-2">
                <div className="space-y-2">
                  {userListLoading ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Loading users...
                    </div>
                  ) : userList.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No users available to invite.
                    </div>
                  ) : (
                    userList.map(user => {
                      const isChecked = selectedMemberIds.includes(user.id);
                      const fullName =
                        `${user.firstName} ${user.lastName}`.trim();
                      return (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/60"
                        >
                          <Checkbox
                            id={`member-${user.id}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleMember(user.id)}
                          />
                          <div>
                            <p className="text-sm font-medium">{fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.authEmail ||
                                user.roles?.[0]?.label ||
                                "No email"}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
              {errors.channelUserIds && (
                <p className="text-sm text-destructive">
                  {errors.channelUserIds.message}
                </p>
              )}

              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedMembers.map(member => {
                    const fullName =
                      `${member.firstName} ${member.lastName}`.trim();
                    return (
                      <Badge key={member.id} variant="secondary">
                        {fullName}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create channel"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
