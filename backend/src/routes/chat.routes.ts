import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createChannel,
  getChannelsForUser,
  getMessagesByChatChannel,
  sendMessage,
} from "@src/controllers/chat.controller";
import {
  chatChannelListQuerySchema,
  chatChannelListResponseSchema,
  createChatChannelSchema,
} from "@src/schemas/chat.schema";
import { ensureTenantMiddleware } from "@src/middleware/ensureTenantMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";

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
  controller: getChannelsForUser,
});

registrar.get("/chat/messages/:senderId/:receiverId", {
  controller: getMessagesByChatChannel,
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
});
/**@description send chat */
registrar.post("/chat/send", {
  controller: sendMessage,
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
});

export default registrar;
