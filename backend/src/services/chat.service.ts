import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import {
  ChatChannelSchema,
  ChatChannelListItemSchema,
  ChatChannelListQuerySchema,
  ChatMessageSchema,
  CreateChatChannelSchema,
  SendChatMessageSchema,
} from "@src/schemas/chat.schema";
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

  static async getChannelsForUser(
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
        m.id,
        m.text,
        m."mediaUrl",
        m."replyToMessageId",
        m."senderUserId",
        m."createdAt",
        m."updatedAt",
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
}
