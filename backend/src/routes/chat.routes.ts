import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  createChannel,
  getChannelsForUser,
  saveChannelMessage,
} from "@src/controllers/chat.controller";
import {
  chatChannelListQuerySchema,
  chatChannelListResponseSchema,
  chatMessageSchema,
  createChatChannelSchema,
  sendChatMessageSchema,
} from "@src/schemas/chat.schema";
import { ensureTenantMiddleware } from "@src/middleware/ensureTenantMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import { idValidation } from "@src/schemas/common.schema";

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

registrar.post("/chat/channel/:channelId/message", {
  middlewares: [ensureTenantMiddleware(), authRoleMiddleware()],
  requestSchema: {
    paramsSchema: { channelId: idValidation },
    bodySchema: sendChatMessageSchema,
  },
  responseSchemas: [{ statusCode: 201, schema: chatMessageSchema }],
  controller: saveChannelMessage,
});

export default registrar;
