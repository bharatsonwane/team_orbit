import { NextFunction, Request, Response } from "express";
import Chat from "@src/services/chat.service";
import ChatSocket from "@src/socket/chat.socket";
import {
  ChatChannelListQuerySchema,
  chatChannelListQuerySchema,
  ChatMessageListQuerySchema,
  CreateChatChannelSchema,
  SendChatMessageSchema,
  sendChatMessageSchema,
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

export const saveChannelMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const chatChannelId = Number(req.params.chatChannelId);
    const payload = req.body as SendChatMessageSchema;

    const isMember = await Chat.isUserChannelMember(
      req.db,
      chatChannelId,
      userId
    );
    if (!isMember) {
      throw {
        statusCode: 403,
        message: "You are not a member of this channel",
      };
    }

    const message = await Chat.saveChannelMessage(req.db, {
      chatChannelId,
      senderUserId: userId,
      ...payload,
    });

    res.status(201).json(message);
    ChatSocket.notifyChatMessage(tenantId, chatChannelId, message);
  } catch (error) {
    next(error);
  }
};

export const getChannelMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as ChatMessageListQuerySchema;
    const { before, limit } = query;
    const userId = req.user?.userId!;
    const chatChannelId = Number(req.params.chatChannelId);

    const isMember = await Chat.isUserChannelMember(
      req.db,
      chatChannelId,
      userId
    );
    if (!isMember) {
      throw {
        statusCode: 403,
        message: "You are not a member of this channel",
      };
    }

    const messages = await Chat.getChannelMessages(req.db, {
      chatChannelId,
      userId,
      before,
      limit,
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
