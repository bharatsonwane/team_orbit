import express from 'express';
import lookupRoutes from './lookup.routes';
import userRoutes from './user.routes';
import ChatRoutes from './chat.routes';
import tenantRoutes from './tenant.routes';

const routes = express.Router();

routes.use('/lookup', lookupRoutes.router);
routes.use('/user', userRoutes.router);
routes.use('/chat', ChatRoutes.router);
routes.use('/tenant', tenantRoutes.router);

export default routes;
