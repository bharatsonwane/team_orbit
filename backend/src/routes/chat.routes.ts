import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createChannel,
  getChatChannelsForUser,
  saveChannelMessage,
  getChannelMessages,
  handleMessageReaction,
  updateChannelMessage,
  archiveChatMessage,
} from "@src/controllers/chat.controller";
import {
  chatChannelListQuerySchema,
  chatChannelListResponseSchema,
  chatMessageSchema,
  chatMessageListQuerySchema,
  chatMessageListResponseSchema,
  createChatChannelSchema,
  sendChatMessageSchema,
  addMessageReactionSchema,
  messageReactionSchema,
  archiveChatMessageSchema,
  updateChatMessageSchema,
} from "@src/schemaAndTypes/chat.schema";
import { ensureTenantMiddleware } from "@src/middleware/ensureTenantMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { idValidation } from "@src/schemaAndTypes/common.schema";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Chat"],
});

registrar.post("/chat/channel/create", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    bodySchema: createChatChannelSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: {} }],
  controller: createChannel,
});

registrar.get("/chat/channel/list", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    querySchema: chatChannelListQuerySchema,
  },
  responseSchemas: [{ statusCode: 200, schema: chatChannelListResponseSchema }],
  controller: getChatChannelsForUser,
});

registrar.post("/chat/channel/:chatChannelId/message", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { chatChannelId: idValidation },
    bodySchema: sendChatMessageSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: chatMessageSchema }],
  controller: saveChannelMessage,
});

registrar.get("/chat/channel/:chatChannelId/messages", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { chatChannelId: idValidation },
    querySchema: chatMessageListQuerySchema,
  },
  responseSchemas: [{ statusCode: 200, schema: chatMessageListResponseSchema }],
  controller: getChannelMessages,
});

registrar.post("/chat/channel/:chatChannelId/message/:messageId/reaction", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: {
      chatChannelId: idValidation,
      messageId: idValidation,
    },
    bodySchema: addMessageReactionSchema,
  },
  responseSchemas: [
    { statusCode: 200, schema: messageReactionSchema },
    { statusCode: 201, schema: messageReactionSchema },
  ],
  controller: handleMessageReaction,
});

registrar.put("/chat/channel/:chatChannelId/message/:messageId", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: {
      chatChannelId: idValidation,
      messageId: idValidation,
    },
    bodySchema: updateChatMessageSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: chatMessageSchema }],
  controller: updateChannelMessage,
});

registrar.delete("/chat/channel/:chatChannelId/message/:messageId", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: {
      chatChannelId: idValidation,
      messageId: idValidation,
    },
    querySchema: archiveChatMessageSchema,
  },
  responseSchemas: [{ statusCode: 200, schema: chatMessageSchema }],
  controller: archiveChatMessage,
});

export default registrar;
