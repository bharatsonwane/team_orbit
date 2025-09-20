import { dbClientPool } from '../middleware/dbClientMiddleware';

interface ChatMessageData {
  text?: string | null;
  media?: string | null;
  sentUserId: string;
  chatChannelId: string;
  deliveredTo?: string[];
  readBy?: string[];
  reaction?: Record<string, any>;
}

interface ChatMessage {
  id: string;
  text: string | null;
  media: string | null;
  sentUserId: string;
  chatChannelId: string;
  createdAt: string;
  deliveredTo: string[];
  readBy: string[];
  reaction: Record<string, any>;
}

export default class Chat {
  static async saveMessage(
    dbClient: dbClientPool,
    messageData: ChatMessageData
  ): Promise<ChatMessage> {
    const query = `
      INSERT INTO chat_message (
        text,
        media,
        "sentUserId",
        "chatChannelId",
        "createdAt",
        "deliveredTo",
        "readBy",
        "reaction"
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
      RETURNING *;
    `;

    // Ensure JSON-valid defaults
    const deliveredTo = Array.isArray(messageData.deliveredTo)
      ? messageData.deliveredTo
      : [];
    const readBy = Array.isArray(messageData.readBy) ? messageData.readBy : [];
    const reaction =
      messageData.reaction &&
      typeof messageData.reaction === 'object' &&
      !Array.isArray(messageData.reaction)
        ? messageData.reaction
        : {};

    const values = [
      messageData.text || null,
      messageData.media || null,
      messageData.sentUserId,
      messageData.chatChannelId,
      JSON.stringify(deliveredTo),
      JSON.stringify(readBy),
      JSON.stringify(reaction),
    ];

    console.log('Inserting chat message with values:', values);

    try {
      const result = await dbClient.mainPool.query(query, values);
      if (!result || result.rows.length === 0) {
        throw new Error('No rows returned from insert');
      }
      return result.rows[0] as ChatMessage;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw new Error('Failed to insert chat message');
    }
  }

  static async getMessagesForChannel(
    dbClient: dbClientPool,
    chatChannelId: string
  ): Promise<ChatMessage[]> {
    const query = `
      SELECT * FROM chat_message
      WHERE "chatChannelId" = $1
      ORDER BY "createdAt" ASC;
    `;
    try {
      const result = await dbClient.mainPool.query(query, [chatChannelId]);
      return result.rows as ChatMessage[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages for chat channel');
    }
  }

  static async saveMessageFromSocket(
    dbClient: dbClientPool,
    data: {
      senderId: string;
      receiverId: string;
      message: string;
      mediaUrl?: string;
    }
  ): Promise<ChatMessage> {
    // This method is used by the socket.io handler
    return await Chat.saveMessage(dbClient, {
      text: data.message,
      media: data.mediaUrl,
      sentUserId: data.senderId,
      chatChannelId: data.receiverId, // Using receiverId as chat_channel_id for simplicity
      deliveredTo: [],
      readBy: [],
      reaction: {},
    });
  }
}
