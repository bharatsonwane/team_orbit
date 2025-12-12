import { NextFunction, Request, Response } from "express";
import Chat from "@src/services/chat.service";
import { ChatSocketController } from "@src/socket/controller/chat.socket.controller";

import {
  ChatChannelListQuerySchema,
  chatChannelListQuerySchema,
  ChatMessageListQuerySchema,
  CreateChatChannelSchema,
  SendChatMessageSchema,
  sendChatMessageSchema,
  AddMessageReactionSchema,
  RemoveMessageReactionSchema,
} from "@src/schemaAndTypes/chat.schema";
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

export const getChatChannelsForUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const query = chatChannelListQuerySchema.parse(
      req.query
    ) as ChatChannelListQuerySchema;

    const channels = await Chat.getChatChannelsForUser(req.db, userId, query);

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
      text: payload.text,
      mediaUrl: payload.mediaUrl,
      replyToMessageId: payload.replyToMessageId,
    });

    // Include tempId and senderSocketId in the broadcast
    ChatSocketController.notifyChatMessage({
      tenantId,
      chatChannelId,
      userId,
      socketId: payload.socketId!,
      message: {
        ...message,
        tempId: payload.tempId,
      },
    });
    res.status(201).json(message);
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

export const handleMessageReaction = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId!;
    const chatChannelId = Number(req.params.chatChannelId);
    const messageId = Number(req.params.messageId);
    const { reaction } = req.body as AddMessageReactionSchema;

    // Check if user is a member of the channel
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

    // Get message details including createdAt
    const messageDetails = await Chat.getMessageWithCreatedAt(
      req.db,
      messageId,
      chatChannelId
    );

    if (!messageDetails) {
      throw {
        statusCode: 404,
        message: "Message not found in this channel",
      };
    }

    // Get existing user reaction for this message
    const existingReaction = await Chat.getExistingUserReaction(req.db, {
      messageId,
      messageCreatedAt: messageDetails.createdAt,
      userId,
    });

    let responseData;

    if (existingReaction) {
      // If user is trying to add the same reaction, remove it instead
      if (existingReaction.reaction === reaction) {
        await Chat.deleteMessageReaction(req.db, {
          reactionId: existingReaction.id,
        });
        responseData = {
          message: "Reaction removed",
          action: "removed",
          isRemoved: true,
          reactionId: existingReaction.id,
          messageId,
          userId,
          reaction,
        };
      } else {
        // Update existing reaction with new emoji
        const updatedReaction = await Chat.updateMessageReaction(req.db, {
          reactionId: existingReaction.id,
          reaction,
        });
        responseData = {
          ...updatedReaction,
          action: "updated",
          isUpdated: true,
        };
      }
    } else {
      // Create new reaction
      const newReaction = await Chat.createMessageReaction(req.db, {
        messageId,
        messageCreatedAt: messageDetails.createdAt,
        userId,
        reaction,
      });
      responseData = {
        ...newReaction,
        action: "created",
        isUpdated: false,
      };
    }

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};
