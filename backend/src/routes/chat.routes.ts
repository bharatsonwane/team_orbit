import RouteRegistrar from "@src/middleware/RouteRegistrar";
import {
  getMessagesByChatChannel,
  sendMessage,
} from "@src/controllers/chat.controller";
import { tenantHeaderMiddleware } from "@src/middleware/tenantHeaderMiddleware";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";

const registrar = new RouteRegistrar({
  basePath: "/api/chat",
  tags: ["Chat"],
});

registrar.get("/chat/:senderId/:receiverId", {
  controller: getMessagesByChatChannel,
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
});
/**@description send chat */
registrar.post("/send", {
  controller: sendMessage,
  middlewares: [tenantHeaderMiddleware(), authRoleMiddleware()],
});

export default registrar;
