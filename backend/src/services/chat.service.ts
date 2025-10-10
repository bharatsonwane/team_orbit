import { dbClientPool } from "../middleware/dbClientMiddleware";
import { ChatMessageSchema } from "../schemas/chat.schema";

export default class Chat {
  static async saveMessage(
    dbClient: dbClientPool,
    messageData: ChatMessageSchema
  ): Promise<ChatMessageSchema> {
    const query = `
      INSERT INTO chat_message (
        text,
        media,
        "sentUserId",
        "channelId",
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
      typeof messageData.reaction === "object" &&
      !Array.isArray(messageData.reaction)
        ? messageData.reaction
        : {};

    const values = [
      messageData.text || null,
      messageData.media || null,
      messageData.senderUserId,
      messageData.channelId,
      JSON.stringify(deliveredTo),
      JSON.stringify(readBy),
      JSON.stringify(reaction),
    ];

    console.log("Inserting chat message with values:", values);

    try {
      const result = await dbClient.mainPool.query(query, values);
      if (!result || result.rows.length === 0) {
        throw new Error("No rows returned from insert");
      }
      return result.rows[0] as ChatMessageSchema;
    } catch (error) {
      console.error("Error saving chat message:", error);
      throw new Error("Failed to insert chat message");
    }
  }

  static async getMessagesForChannel(
    dbClient: dbClientPool,
    channelId: string
  ): Promise<ChatMessageSchema[]> {
    const query = `
      SELECT * FROM chat_message
      WHERE "channelId" = $1
      ORDER BY "createdAt" ASC;
    `;
    try {
      const result = await dbClient.mainPool.query(query, [channelId]);
      return result.rows as ChatMessageSchema[];
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Failed to fetch messages for chat channel");
    }
  }

  // static async saveMessageFromSocket(
  //   dbClient: dbClientPool,
  //   data: {
  //     senderUserId: string;
  //     receiverId: string;
  //     message: string;
  //     mediaUrl?: string;
  //   }
  // ): Promise<ChatMessageSchema> {
  //   // This method is used by the socket.io handler
  //   // return await Chat.saveMessage(dbClient, {
  //   //   text: data.message,
  //   //   media: data.mediaUrl,
  //   //   senderUserId: data.senderUserId,
  //   //   channelId: data.receiverId,
  //   //   deliveredTo: [],
  //   //   readBy: [],
  //   //   reaction: {},
  //   // });
  // }
}
