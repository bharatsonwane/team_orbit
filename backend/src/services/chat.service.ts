import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import {
  ChatChannelSchema,
  ChatChannelListItemSchema,
  ChatChannelListQuerySchema,
  ChatMessageSchema,
  CreateChatChannelSchema,
  SendChatMessageSchema,
} from "@src/schemaAndTypes/chat.schema";
import { dbTransactionKeys } from "@src/utils/constants";

interface CreateChannelParams extends CreateChatChannelSchema {
  createdBy: number;
}

interface SendChatMessageParams extends SendChatMessageSchema {
  chatChannelId: number;
  senderUserId: number;
}

export default class Chat {
  static async isUserChannelMember(
    dbClient: dbClientPool,
    chatChannelId: number,
    userId: number
  ): Promise<boolean> {
    const membership = await dbClient.tenantPool!.query(
      `
        SELECT 1
        FROM chat_channel_user_mapping
        WHERE "chatChannelId" = $1
          AND "userId" = $2
          AND "isActive" = TRUE;
      `,
      [chatChannelId, userId]
    );

    return (membership?.rowCount ?? 0) > 0;
  }

  static async createChannel(
    dbClient: dbClientPool,
    {
      name,
      description,
      type,
      image,
      channelUserIds,
      createdBy,
    }: CreateChannelParams
  ): Promise<ChatChannelSchema> {
    let uniqueMemberIds = Array.from(new Set([...channelUserIds]));
    uniqueMemberIds = uniqueMemberIds.filter(id => id !== createdBy);

    try {
      await dbClient.tenantPool!.query(dbTransactionKeys.BEGIN);

      const channelResult = await dbClient.tenantPool!.query(
        `
        INSERT INTO chat_channel (
          name,
          type,
          description,
          image,
          "createdBy"
        )
        VALUES ('${name}', '${type}', '${description ?? ""}', '${image ?? ""}', ${createdBy})
        RETURNING *;
      `
      );

      const channel = channelResult?.rows[0] as ChatChannelSchema;

      /** chatChannelId, userId, isAdmin */
      let userMappingRows = `(${channel.id!}, ${createdBy}, TRUE)`; // createdBy is admin

      uniqueMemberIds.forEach(userId => {
        userMappingRows += `, (${channel.id!}, ${userId}, FALSE)`;
      });

      await dbClient.tenantPool!.query(`
        INSERT INTO chat_channel_user_mapping (
          "chatChannelId",
          "userId",
          "isAdmin"
        )
        VALUES ${userMappingRows};
      `);

      await dbClient.tenantPool!.query(dbTransactionKeys.COMMIT);

      return {
        ...channel,
      };
    } catch (error) {
      await dbClient.tenantPool!.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  static async getChatChannelsForUser(
    dbClient: dbClientPool,
    userId: number,
    { search, type, limit = 50, offset = 0 }: ChatChannelListQuerySchema
  ): Promise<ChatChannelListItemSchema[]> {
    const tenantPool = dbClient.tenantPool!;

    const filters: string[] = [
      `cm."userId" = $1`,
      `cm."isActive" = TRUE`,
      `c."isActive" = TRUE`,
    ];
    const params: Array<string | number> = [userId];

    if (type) {
      params.push(type);
      filters.push(`c.type = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      filters.push(
        `(c.name ILIKE $${idx} OR COALESCE(c.description, '') ILIKE $${idx})`
      );
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const dataParams = [...params, limit, offset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const channelQuery = `
      WITH user_channels AS (
        SELECT DISTINCT
        c.id,
        c.name,
        c.type,
        c.description,
        c.image,
        c."createdBy",
        c."createdAt",
        c."updatedAt",
        cm."isAdmin" AS "isCurrentUserAdmin"
      FROM chat_channel c
      INNER JOIN chat_channel_user_mapping cm
        ON cm."chatChannelId" = c.id
      ${whereClause}
      )
      SELECT
        uc.id,
        uc.name,
        uc.type,
        uc.description,
        uc.image,
        uc."createdBy",
        uc."createdAt",
        uc."updatedAt",
        uc."isCurrentUserAdmin",
        COALESCE(
          JSON_AGG(u.id ORDER BY u."firstName", u."lastName"),
          '[]'::json
        ) AS members
      FROM user_channels uc
      LEFT JOIN chat_channel_user_mapping cm_all
        ON cm_all."chatChannelId" = uc.id AND cm_all."isActive" = TRUE
      LEFT JOIN main.users u
        ON u.id = cm_all."userId"
      GROUP BY
        uc.id,
        uc.name,
        uc.type,
        uc.description,
        uc.image,
        uc."createdBy",
        uc."createdAt",
        uc."updatedAt",
        uc."isCurrentUserAdmin"
      ORDER BY uc."updatedAt" DESC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx};
    `;

    const channelResult = await tenantPool.query(channelQuery, dataParams);

    const channels: ChatChannelListItemSchema[] = channelResult.rows.map(
      row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description ?? null,
        image: row.image ?? null,
        createdBy: row.createdBy ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        members: Array.isArray(row.members) ? row.members : [],
        isCurrentUserAdmin: Boolean(row.isCurrentUserAdmin),
      })
    );

    return channels;
  }

  static async saveChannelMessage(
    dbClient: dbClientPool,
    {
      chatChannelId,
      senderUserId,
      text,
      mediaUrl,
      replyToMessageId,
    }: SendChatMessageParams
  ): Promise<ChatMessageSchema> {
    const tenantPool = dbClient.tenantPool!;

    const insertQuery = `
      INSERT INTO chat_message (
        "chatChannelId",
        "senderUserId",
        "replyToMessageId",
        text,
        "mediaUrl",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${chatChannelId},
        ${senderUserId},
        ${replyToMessageId ?? null},
        '${text ?? ""}',
        '${mediaUrl ?? ""}',
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const result = await tenantPool.query(insertQuery);
    return result.rows[0] as ChatMessageSchema;
  }

  static async getChannelMessages(
    dbClient: dbClientPool,
    {
      chatChannelId,
      userId,
      before,
      limit = 50,
    }: {
      chatChannelId: number;
      userId: number;
      before?: string;
      limit?: number;
    }
  ): Promise<ChatMessageSchema[]> {
    const tenantPool = dbClient.tenantPool!;

    let where = `WHERE m."chatChannelId" = ${chatChannelId}`;
    if (before) {
      where += ` AND m."createdAt" < '${before}'`;
    }

    const query = `
      WITH latest_messages AS (
        SELECT 
          m.id,
          m."createdAt"
        FROM chat_message m
        ${where}
        ORDER BY m."createdAt" DESC
        LIMIT ${limit}
      )
      SELECT
        m.id::integer,
        m.text,
        m."mediaUrl",
        m."replyToMessageId",
        m."senderUserId",
        m."createdAt",
        m."updatedAt",
        m."isEdited",
        m."isArchived",
        m."archivedAt",
        m."archivedBy",
        m."chatChannelId" AS "chatChannelId",
        COALESCE(
          JSON_AGG(
            JSONB_BUILD_OBJECT(
              'id', r.id,
              'userId', r."userId",
              'reaction', r.reaction,
              'createdAt', r."createdAt"::text
            )
            ORDER BY r."createdAt"
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) AS reactions,
        COALESCE(
          JSON_AGG(
            JSONB_BUILD_OBJECT(
              'id', s.id,
              'userId', s."userId",
              'deliveredAt', s."deliveredAt"::text,
              'readAt', s."readAt"::text
            )
            ORDER BY s."userId"
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) AS receipt
      FROM latest_messages lm
      INNER JOIN chat_message m
        ON m.id = lm.id 
        AND m."createdAt" = lm."createdAt"
      LEFT JOIN chat_message_reaction r 
        ON r."messageId" = m.id 
        AND r."messageCreatedAt" = m."createdAt"
      LEFT JOIN chat_message_receipt s 
        ON s."messageId" = m.id 
        AND s."messageCreatedAt" = m."createdAt"
      GROUP BY 
        m.id,
        m."createdAt",
        m."chatChannelId"
      ORDER BY m."createdAt" ASC;
    `;

    const { rows } = await tenantPool.query(query);
    return rows as ChatMessageSchema[];
  }

  static async getExistingUserReaction(
    dbClient: dbClientPool,
    {
      messageId,
      messageCreatedAt,
      userId,
    }: {
      messageId: number;
      messageCreatedAt: string;
      userId: number;
    }
  ): Promise<{ id: number; reaction: string } | null> {
    const tenantPool = dbClient.tenantPool!;

    const result = await tenantPool.query(
      `
        SELECT id, reaction FROM chat_message_reaction 
        WHERE "messageId" = $1 
          AND "messageCreatedAt" = $2 
          AND "userId" = $3
      `,
      [messageId, messageCreatedAt, userId]
    );

    return result.rowCount && result.rowCount > 0 ? result.rows[0] : null;
  }

  static async createMessageReaction(
    dbClient: dbClientPool,
    {
      messageId,
      messageCreatedAt,
      userId,
      reaction,
    }: {
      messageId: number;
      messageCreatedAt: string;
      userId: number;
      reaction: string;
    }
  ): Promise<{
    id: number;
    messageId: number;
    userId: number;
    reaction: string;
    createdAt: string;
  }> {
    const tenantPool = dbClient.tenantPool!;

    const insertQuery = `
      INSERT INTO chat_message_reaction (
        "messageId",
        "messageCreatedAt",
        "userId",
        reaction,
        "createdAt"
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, "messageId", "userId", reaction, "createdAt"::text;
    `;

    const result = await tenantPool.query(insertQuery, [
      messageId,
      messageCreatedAt,
      userId,
      reaction,
    ]);

    return result.rows[0];
  }

  static async updateMessageReaction(
    dbClient: dbClientPool,
    {
      reactionId,
      reaction,
    }: {
      reactionId: number;
      reaction: string;
    }
  ): Promise<{
    id: number;
    messageId: number;
    userId: number;
    reaction: string;
    createdAt: string;
  }> {
    const tenantPool = dbClient.tenantPool!;

    const updateQuery = `
      UPDATE chat_message_reaction 
      SET reaction = $1, "createdAt" = NOW()
      WHERE id = $2
      RETURNING id, "messageId", "userId", reaction, "createdAt"::text;
    `;

    const result = await tenantPool.query(updateQuery, [reaction, reactionId]);

    if (result.rowCount === 0) {
      throw {
        statusCode: 404,
        message: "Reaction not found",
      };
    }

    return result.rows[0];
  }

  static async deleteMessageReaction(
    dbClient: dbClientPool,
    {
      reactionId,
    }: {
      reactionId: number;
    }
  ): Promise<void> {
    const tenantPool = dbClient.tenantPool!;

    const deleteQuery = `
      DELETE FROM chat_message_reaction 
      WHERE id = $1
      RETURNING id;
    `;

    const result = await tenantPool.query(deleteQuery, [reactionId]);

    if (result.rowCount === 0) {
      throw {
        statusCode: 404,
        message: "Reaction not found",
      };
    }
  }

  static async getMessageWithCreatedAt(
    dbClient: dbClientPool,
    messageId: number,
    chatChannelId: number
  ): Promise<{
    id: number;
    createdAt: string;
    chatChannelId: number;
    senderUserId: number;
  } | null> {
    const tenantPool = dbClient.tenantPool!;

    const query = `
      SELECT id, "createdAt"::text, "chatChannelId", "senderUserId"
      FROM chat_message 
      WHERE id = $1 AND "chatChannelId" = $2;
    `;

    const result = await tenantPool.query(query, [messageId, chatChannelId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async updateChannelMessage(
    dbClient: dbClientPool,
    {
      messageId,
      chatChannelId,
      text,
      mediaUrl,
    }: {
      messageId: number;
      chatChannelId: number;
      text?: string;
      mediaUrl?: string;
    }
  ): Promise<ChatMessageSchema | null> {
    const tenantPool = dbClient.tenantPool!;

    const query = `
      UPDATE chat_message 
      SET text = $1, "mediaUrl" = $2, "updatedAt" = NOW(), "isEdited" = TRUE
      WHERE id = $3 AND "chatChannelId" = $4
      RETURNING 
        id::integer,
        text,
        "mediaUrl",
        "replyToMessageId",
        "senderUserId",
        "createdAt",
        "updatedAt",
        "isEdited",
        "isArchived",
        "archivedAt",
        "archivedBy",
        "chatChannelId" AS "chatChannelId";
    `;

    const result = await tenantPool.query(query, [
      text ?? "",
      mediaUrl ?? "",
      messageId,
      chatChannelId,
    ]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async archiveMessage(
    dbClient: dbClientPool,
    {
      messageId,
      userId,
      chatChannelId,
    }: {
      messageId: number;
      userId: number;
      chatChannelId: number;
    }
  ): Promise<{
    id: number;
    isArchived: boolean;
    archivedAt: string;
    archivedBy: number;
  } | null> {
    const tenantPool = dbClient.tenantPool!;

    const query = `
      UPDATE chat_message 
      SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
      WHERE id = $2 AND "chatChannelId" = $3
      RETURNING id, "isArchived", "archivedAt"::text, "archivedBy";
    `;

    const result = await tenantPool.query(query, [
      userId,
      messageId,
      chatChannelId,
    ]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
