import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import {
  ChatChannelSchema,
  ChatChannelListItemSchema,
  ChatChannelListQuerySchema,
  CreateChatChannelSchema,
} from "@src/schemas/chat.schema";
import { dbTransactionKeys } from "@src/utils/constants";

interface CreateChannelParams extends CreateChatChannelSchema {
  createdBy: number;
}

export default class Chat {
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

      /** channelId, userId, isAdmin */
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
      SELECT
        c.id,
        c.name,
        c.type,
        c.description,
        c.image,
        c."createdBy",
        c."createdAt",
        c."updatedAt",
        COALESCE(member_stats.member_count, 0) AS "memberCount",
        cm."isAdmin" AS "isCurrentUserAdmin"
      FROM chat_channel c
      INNER JOIN chat_channel_user_mapping cm
        ON cm."chatChannelId" = c.id
      LEFT JOIN (
        SELECT "chatChannelId", COUNT(*) AS member_count
        FROM chat_channel_user_mapping
        WHERE "isActive" = TRUE
        GROUP BY "chatChannelId"
      ) AS member_stats ON member_stats."chatChannelId" = c.id
      ${whereClause}
      ORDER BY c."updatedAt" DESC
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
        memberCount: Number(row.memberCount ?? 0),
        isCurrentUserAdmin: Boolean(row.isCurrentUserAdmin),
      })
    );

    return channels;
  }
}
