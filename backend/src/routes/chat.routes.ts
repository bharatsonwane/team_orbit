import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  getMessagesByChatChannel,
  sendMessage,
} from "@src/controllers/chat.controller";
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";

const registrar = new RouteRegistrar({
  basePath: "/api",
  tags: ["Chat"],
});

registrar.get("/chat/messages/:senderId/:receiverId", {
  controller: getMessagesByChatChannel,
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
});
/**@description send chat */
registrar.post("/chat/send", {
  controller: sendMessage,
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
});

export default registrar;
