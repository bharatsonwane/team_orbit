import { NextFunction, Request, Response } from 'express';
import Chat from '../services/chat.service';

interface ChatMessageBody {
  text: string;
  media?: string;
  sentUserId: string;
  chatChannelId: string;
  deliveredTo?: string[];
  readBy?: string[];
  reaction?: Record<string, any>;
}

export const sendMessage = async (
  req: Request<{}, {}, ChatMessageBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      text,
      media,
      sentUserId,
      chatChannelId,
      deliveredTo,
      readBy,
      reaction,
    } = req.body;

    const savedMessage = await Chat.saveMessage(req.db, {
      text,
      media,
      sentUserId,
      chatChannelId,
      deliveredTo,
      readBy,
      reaction: reaction || {},
    });

    res.status(201).json({
      success: true,
      message: 'Message sent',
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
    const { chatChannelId } = req.params as { chatChannelId: string };

    const messages = await Chat.getMessagesForChannel(req.db, chatChannelId);
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
