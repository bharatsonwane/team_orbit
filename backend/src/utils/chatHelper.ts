export const getChatChannelRoomName = ({
  tenantId,
  chatChannelId,
}: {
  tenantId: number;
  chatChannelId: number;
}) => {
  return `chatChannel?tenantId=${tenantId}&chatChannelId=${chatChannelId}`;
};
