import { NextFunction, Request, Response } from "express";
import Chat from "@src/services/chat.service";
import {
  ChatChannelListQuerySchema,
  chatChannelListQuerySchema,
  ChatMessageSchema,
  CreateChatChannelSchema,
} from "@src/schemas/chat.schema";
import { AuthenticatedRequest } from "@src/middleware/authRoleMiddleware";

export const createChannel = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user } = req;
    if (!user?.userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }

    const payload = req.body;
    const result = await Chat.createChannel(req.db, {
      ...payload,
      createdBy: user.userId,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getChannelsForUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const query = chatChannelListQuerySchema.parse(
      req.query
    ) as ChatChannelListQuerySchema;

    const channels = await Chat.getChannelsForUser(req.db, userId, query);

    res.status(200).json(channels);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: Request<{}, {}, ChatMessageSchema>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      text,
      media,
      senderUserId,
      channelId,
      deliveredTo,
      readBy,
      reaction,
    } = req.body;

    res.status(201).json({});
  } catch (error) {
    next(error);
  }
};

export const getMessagesByChatChannel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { channelId } = req.params as { channelId: string };

    res.status(200).json({});
  } catch (error) {
    next(error);
  }
};
