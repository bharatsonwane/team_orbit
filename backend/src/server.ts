import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
// import { Server } from 'socket.io';
import logger from './utils/logger';
import { displayServerInfo } from './utils/terminalUtils';

import { envVariable } from './config/envVariable';
import apiRoutes from './routes/routes';
import openApiRoutes from './openApiSpecification/openApiRoutes';
import {
  globalErrorMiddleware,
  routeNotFoundMiddleware,
} from './middleware/errorMiddleware';
import { dbClientMiddleware } from './middleware/dbClientMiddleware';

async function main() {
  const app = express();
  const server = http.createServer(app);

  // const io = new Server(server, {
  //   cors: {
  //     origin: "http://localhost:5173",
  //     credentials: true,
  //   },
  // });

  // io.on("connection", (socket) => {
  //   console.log("User connected:", socket.id);

  //   socket.on("joinChannel", ({ userId }) => {
  //     socket.join(userId); // joining channel using user ID
  //   });

  //   socket.on("sendMessage", async (data) => {
  //     const { senderId, receiverId, message, mediaUrl } = data;

  //     // TODO: Implement Chat service when converted to TypeScript
  //     // const savedMessage = await Chat.saveMessage({ senderId, receiverId, message, mediaUrl });
  //     // io.to(receiverId).emit("receiveMessage", savedMessage);

  //     console.log("Message received:", { senderId, receiverId, message, mediaUrl });
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("User disconnected:", socket.id);
  //   });
  // });

  const PORT = envVariable.API_PORT;

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  /** Routes */
  app.use('/api', dbClientMiddleware, apiRoutes);
  app.use('/docs', openApiRoutes);

  /** Health check endpoint */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  });

  /** 404 handler - must come after all routes */
  app.use(routeNotFoundMiddleware);

  /** Global error handler - must be last */
  app.use(globalErrorMiddleware);

  /** Start server */
  server.listen(PORT, () => {
    displayServerInfo({
      port: PORT,
      host: envVariable.API_HOST,
      appName: '📚 Team Orbit Backend',
      docsPath: '/docs',
    });
  });
}

main().catch(error => {
  logger.error('Error in main function:', error);
  process.exit(1);
});
