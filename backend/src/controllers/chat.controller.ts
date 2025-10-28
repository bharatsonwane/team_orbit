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
