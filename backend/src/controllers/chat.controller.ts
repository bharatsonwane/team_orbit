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
  ArchiveChatMessageSchema,
  UpdateChatMessageSchema,
} from "@src/schemaTypes/chat.schemaTypes";
import { AuthenticatedRequest } from "@src/middleware/authPermissionMiddleware";

// Helper function for channel membership validation
const validateChannelMembership = async (
  req: AuthenticatedRequest,
  chatChannelId: number,
  userId: number
) => {
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
};

// Helper function for common validations (membership + message existence)
const validateChannelMembershipAndMessage = async (
  req: AuthenticatedRequest,
  chatChannelId: number,
  messageId: number,
  userId: number
) => {
  // Check if user is a member of the channel
  await validateChannelMembership(req, chatChannelId, userId);

  // Check if message exists in the channel
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

  return messageDetails;
};

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

    // Validate user membership
    await validateChannelMembership(req, chatChannelId, userId);

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

    // Validate user membership
    await validateChannelMembership(req, chatChannelId, userId);

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
    const tenantId = req.user.tenantId;
    const userId = req.user?.userId!;
    const chatChannelId = Number(req.params.chatChannelId);
    const messageId = Number(req.params.messageId);
    const { reaction, socketId } = req.body as AddMessageReactionSchema;

    // Validate user membership and message existence
    const messageDetails = await validateChannelMembershipAndMessage(
      req,
      chatChannelId,
      messageId,
      userId
    );

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
        // Update existing reaction with new reaction
        const updatedReaction = await Chat.updateMessageReaction(req.db, {
          reactionId: existingReaction.id,
          reaction,
        });
        responseData = {
          ...updatedReaction,
          reactionId: existingReaction.id,
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
        reactionId: newReaction.id,
        action: "created",
        isUpdated: false,
      };
    }

    // Notify all channel members about the reaction change via socket
    ChatSocketController.notifyChatReaction({
      tenantId,
      chatChannelId,
      messageId,
      userId,
      reactionId: responseData.reactionId,
      reaction: reaction,
      action:
        responseData.action === "removed"
          ? "remove"
          : responseData.action === "updated"
            ? "update"
            : "add",
      senderSocketId: socketId,
    });

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

export const updateChannelMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user } = req;
    if (!user?.userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }

    const tenantId = user.tenantId;
    const userId = user.userId;
    const chatChannelId = Number(req.params.chatChannelId);
    const messageId = Number(req.params.messageId);
    const payload = req.body as UpdateChatMessageSchema;

    // Validate user membership and message existence
    const messageDetails = await validateChannelMembershipAndMessage(
      req,
      chatChannelId,
      messageId,
      userId
    );

    // Check if the user is the sender of the message
    if (messageDetails.senderUserId !== userId) {
      throw {
        statusCode: 403,
        message: "You can only edit your own messages",
      };
    }

    // Update the message
    const updatedMessage = await Chat.updateChannelMessage(req.db, {
      messageId,
      chatChannelId,
      text: payload.text,
      mediaUrl: payload.mediaUrl,
    });

    if (!updatedMessage) {
      throw {
        statusCode: 500,
        message: "Failed to update message",
      };
    }

    // Notify channel members via socket
    ChatSocketController.notifyMessageUpdate({
      tenantId,
      chatChannelId,
      messageId,
      userId,
      senderSocketId: payload.socketId,
      updatedMessage,
    });

    res.status(200).json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

export const archiveChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user } = req;
    if (!user?.userId) {
      throw { statusCode: 401, message: "User not authenticated" };
    }

    const tenantId = user.tenantId;
    const userId = user.userId;
    const chatChannelId = Number(req.params.chatChannelId);
    const messageId = Number(req.params.messageId);
    const { socketId } = req.query as ArchiveChatMessageSchema;

    // Validate user membership and message existence
    await validateChannelMembershipAndMessage(
      req,
      chatChannelId,
      messageId,
      userId
    );

    // Archive the message
    const archivedMessage = await Chat.archiveMessage(req.db, {
      messageId,
      userId,
      chatChannelId,
    });

    if (!archivedMessage) {
      throw {
        statusCode: 500,
        message: "Failed to archive message",
      };
    }

    // Notify channel members via socket
    ChatSocketController.notifyMessageArchive({
      tenantId,
      chatChannelId,
      messageId,
      userId,
      senderSocketId: socketId,
      archivedAt: archivedMessage.archivedAt,
    });

    res.status(200).json(archivedMessage);
  } catch (error) {
    next(error);
  }
};
