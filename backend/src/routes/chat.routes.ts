import RouteRegistrar from "@src/middleware/RouteRegistrar";
import { authRoleMiddleware } from "@src/middleware/authRoleMiddleware";
import {
  getMessagesByChatChannel,
  sendMessage,
} from "@src/controllers/chat.controller";

const registrar = new RouteRegistrar({
  basePath: "/api/chat",
  tags: ["Chat"],
});

registrar.get("/chat/:senderId/:receiverId", {
  controller: getMessagesByChatChannel,
});
/**@description send chat */
registrar.post("/send", {
  controller: sendMessage,
});

export default registrar;
