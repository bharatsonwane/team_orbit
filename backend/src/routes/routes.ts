import express from "express";
import lookupRoutes from "./lookup.routes";
import tenantRoutes from "./tenant.routes";
import tenantLookupRoutes from "./tenantLookup.routes";
import userRoutes from "./user.routes";
import ChatRoutes from "./chat.routes";

const routes = express.Router();

routes.use("/lookup", lookupRoutes.router);

routes.use("/tenant-lookup", tenantLookupRoutes.router); // Tenant lookup routes

routes.use("/tenant", tenantRoutes.router);
routes.use("/user", userRoutes.router);

routes.use("/chat", ChatRoutes.router);

export default routes;
