import { NextFunction, Request, Response } from "express";
import Chat from "@src/services/chat.service";
import { ChatMessageSchema } from "@src/schemas/chat.schema";

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

    const savedMessage = await Chat.saveMessage(req.db, {
      text,
      media,
      senderUserId,
      channelId,
      deliveredTo,
      readBy,
      reaction: reaction || {},
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: savedMessage,
    });
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

    const messages = await Chat.getMessagesForChannel(req.db, channelId);
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
