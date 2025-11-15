import express from "express";
import lookupRoutes from "./lookup.routes";
import tenantLookupRoutes from "./tenantLookup.routes";
import tenantRoutes from "./tenant.routes";
import userRoutes from "./user.routes";
import ChatRoutes from "./chat.routes";

const routes = express.Router();

routes.use(lookupRoutes.router);
routes.use(tenantLookupRoutes.router);

routes.use(tenantRoutes.router);
routes.use(userRoutes.router);

routes.use(ChatRoutes.router);

export default routes;
