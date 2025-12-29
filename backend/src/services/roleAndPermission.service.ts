import type { dbClientPool } from "@src/middleware/dbClientMiddleware";
import type {
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleWithPermissionsSchema,
  RoleListSchema,
  CreatePermissionSchema,
  UpdatePermissionSchema,
  PermissionWithIdSchema,
  PermissionListSchema,
  RolesAndPermissionsSchema,
} from "@src/schemaTypes/roleAndPermission.schemaTypes";
import { buildUpdateFields } from "@src/utils/queryHelper";
import { dbTransactionKeys } from "@src/utils/constants";

export default class RoleAndPermission {
  // ==================== ROLE METHODS ====================

  /**
   * Get all roles with optional permissions
   */
  static async getRoles(
    dbClient: dbClientPool,
    { includePermissions = false }: { includePermissions?: boolean } = {}
  ): Promise<RoleListSchema> {
    let query = `
      SELECT 
        r.id,
        r.name,
        r.label,
        r.description,
        r."sortOrder",
        r."isSystem",
        r."isArchived",
        r."createdAt",
        r."updatedAt",
        r."archivedAt",
        r."createdBy",
        r."updatedBy",
        r."archivedBy"
    `;

    if (includePermissions) {
      query += `,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'label', p.label
            )
            ORDER BY p."sortOrder", p.label
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS permissions
      `;
    }

    query += `
      FROM roles r
    `;

    if (includePermissions) {
      query += `
        LEFT JOIN role_permissions_xref rpx ON r.id = rpx."roleId" AND rpx."isArchived" = FALSE
        LEFT JOIN permissions p ON rpx."permissionId" = p.id AND p."isArchived" = FALSE
      `;
    }

    query += `
      WHERE r."isArchived" = FALSE
      GROUP BY r.id
      ORDER BY r."sortOrder", r.label
    `;

    const result = await dbClient.mainPool.query(query);
    return result.rows;
  }

  /**
   * Get role by ID with permissions
   */
  static async getRoleById(
    dbClient: dbClientPool,
    roleId: number
  ): Promise<RoleWithPermissionsSchema | null> {
    const query = `
      SELECT 
        r.id,
        r.name,
        r.label,
        r.description,
        r."sortOrder",
        r."isSystem",
        r."isArchived",
        r."createdAt",
        r."updatedAt",
        r."archivedAt",
        r."createdBy",
        r."updatedBy",
        r."archivedBy",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'name', p.name,
              'label', p.label
            )
            ORDER BY p."sortOrder", p.label
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions_xref rpx ON r.id = rpx."roleId" AND rpx."isArchived" = FALSE
      LEFT JOIN permissions p ON rpx."permissionId" = p.id AND p."isArchived" = FALSE
      WHERE r.id = $1 AND r."isArchived" = FALSE
      GROUP BY r.id
    `;

    const result = await dbClient.mainPool.query(query, [roleId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new role with optional permissions
   */
  static async createRole(
    dbClient: dbClientPool,
    {
      roleData,
      userId,
    }: {
      roleData: CreateRoleSchema;
      userId?: number;
    }
  ): Promise<number> {
    try {
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Check if role name already exists
      const existingRole = await dbClient.mainPool.query(
        `SELECT id FROM roles WHERE name = $1 AND "isArchived" = FALSE`,
        [roleData.name]
      );

      if (existingRole.rows.length > 0) {
        throw {
          statusCode: 400,
          message: "Role with this name already exists",
        };
      }

      // Insert role
      const roleQuery = `
        INSERT INTO roles (name, label, description, "sortOrder", "isSystem", "createdBy", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `;

      const roleResult = await dbClient.mainPool.query(roleQuery, [
        roleData.name,
        roleData.label,
        roleData.description || null,
        roleData.sortOrder || 0,
        roleData.isSystem || false,
        userId || null,
      ]);

      const roleId = roleResult.rows[0].id;

      // Assign permissions if provided
      if (roleData.permissionIds && roleData.permissionIds.length > 0) {
        await this.assignPermissionsToRole(
          dbClient,
          roleId,
          roleData.permissionIds,
          userId
        );
      }

      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
      return roleId;
    } catch (error) {
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  /**
   * Update a role
   */
  static async updateRole(
    dbClient: dbClientPool,
    {
      roleId,
      roleData,
      userId,
    }: {
      roleId: number;
      roleData: UpdateRoleSchema;
      userId?: number;
    }
  ): Promise<void> {
    try {
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      // Check if role exists
      const existingRole = await this.getRoleById(dbClient, roleId);
      if (!existingRole) {
        throw { statusCode: 404, message: "Role not found" };
      }

      // Check if name is being updated and if it conflicts
      if (roleData.name && roleData.name !== existingRole.name) {
        const nameConflict = await dbClient.mainPool.query(
          `SELECT id FROM roles WHERE name = $1 AND id != $2 AND "isArchived" = FALSE`,
          [roleData.name, roleId]
        );

        if (nameConflict.rows.length > 0) {
          throw {
            statusCode: 400,
            message: "Role with this name already exists",
          };
        }
      }

      // Build update fields
      const acceptedKeys = [
        "name",
        "label",
        "description",
        "sortOrder",
        "isSystem",
      ];
      const updateFields = buildUpdateFields(acceptedKeys, roleData);

      if (Object.keys(updateFields).length > 0) {
        // Add updatedBy and updatedAt
        updateFields["updatedBy"] = userId ? `${userId}` : "NULL";
        updateFields["updatedAt"] = "NOW()";

        const setQueryString = Object.entries(updateFields)
          .map(([key, value]) => `"${key}" = ${value}`)
          .join(", ");

        const updateQuery = `
          UPDATE roles
          SET ${setQueryString}
          WHERE id = $1 AND "isArchived" = FALSE
        `;

        await dbClient.mainPool.query(updateQuery, [roleId]);
      }

      // Update permissions if provided
      if (roleData.permissionIds !== undefined) {
        // Remove all existing permissions
        await dbClient.mainPool.query(
          `UPDATE role_permissions_xref 
           SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
           WHERE "roleId" = $2 AND "isArchived" = FALSE`,
          [userId || null, roleId]
        );

        // Add new permissions
        if (roleData.permissionIds.length > 0) {
          await this.assignPermissionsToRole(
            dbClient,
            roleId,
            roleData.permissionIds,
            userId
          );
        }
      }

      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  /**
   * Delete (archive) a role
   */
  static async deleteRole(
    dbClient: dbClientPool,
    { roleId, userId }: { roleId: number; userId?: number }
  ): Promise<void> {
    try {
      await dbClient.mainPool.query(dbTransactionKeys.BEGIN);

      const existingRole = await this.getRoleById(dbClient, roleId);
      if (!existingRole) {
        throw { statusCode: 404, message: "Role not found" };
      }

      if (existingRole.isSystem) {
        throw {
          statusCode: 400,
          message: "System roles cannot be deleted",
        };
      }

      // Archive the role
      await dbClient.mainPool.query(
        `UPDATE roles 
         SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
         WHERE id = $2`,
        [userId || null, roleId]
      );

      // Archive all role-permission mappings
      await dbClient.mainPool.query(
        `UPDATE role_permissions_xref 
         SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
         WHERE "roleId" = $2 AND "isArchived" = FALSE`,
        [userId || null, roleId]
      );

      // Archive all user-role mappings
      await dbClient.mainPool.query(
        `UPDATE user_roles_xref 
         SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
         WHERE "roleId" = $2 AND "isArchived" = FALSE`,
        [userId || null, roleId]
      );

      await dbClient.mainPool.query(dbTransactionKeys.COMMIT);
    } catch (error) {
      await dbClient.mainPool.query(dbTransactionKeys.ROLLBACK);
      throw error;
    }
  }

  /**
   * Assign permissions to a role
   */
  static async assignPermissionsToRole(
    dbClient: dbClientPool,
    roleId: number,
    permissionIds: number[],
    userId?: number
  ): Promise<void> {
    if (permissionIds.length === 0) return;

    // Verify all permissions exist
    const placeholders = permissionIds.map((_, i) => `$${i + 1}`).join(", ");
    const verifyQuery = `
      SELECT id FROM permissions 
      WHERE id IN (${placeholders}) AND "isArchived" = FALSE
    `;
    const verifyResult = await dbClient.mainPool.query(
      verifyQuery,
      permissionIds
    );

    if (verifyResult.rows.length !== permissionIds.length) {
      throw {
        statusCode: 400,
        message: "One or more permissions not found",
      };
    }

    // Insert role-permission mappings one by one to handle conflicts properly
    for (const permissionId of permissionIds) {
      await dbClient.mainPool.query(
        `
          INSERT INTO role_permissions_xref ("roleId", "permissionId", "createdBy", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT ("roleId", "permissionId") 
          DO UPDATE SET "isArchived" = FALSE, "archivedAt" = NULL, "archivedBy" = NULL, "updatedAt" = NOW()
        `,
        [roleId, permissionId, userId || null]
      );
    }
  }

  // ==================== PERMISSION METHODS ====================

  /**
   * Get all permissions
   */
  static async getPermissions(
    dbClient: dbClientPool
  ): Promise<PermissionListSchema> {
    const query = `
      SELECT 
        id,
        name,
        label,
        description,
        "sortOrder",
        "isSystem",
        "isArchived",
        "createdAt",
        "updatedAt",
        "archivedAt",
        "createdBy",
        "updatedBy",
        "archivedBy"
      FROM permissions
      WHERE "isArchived" = FALSE
      ORDER BY "sortOrder", label
    `;

    const result = await dbClient.mainPool.query(query);
    return result.rows;
  }

  /**
   * Get permission by ID
   */
  static async getPermissionById(
    dbClient: dbClientPool,
    permissionId: number
  ): Promise<PermissionWithIdSchema | null> {
    const query = `
      SELECT 
        id,
        name,
        label,
        description,
        "sortOrder",
        "isSystem",
        "isArchived",
        "createdAt",
        "updatedAt",
        "archivedAt",
        "createdBy",
        "updatedBy",
        "archivedBy"
      FROM permissions
      WHERE id = $1 AND "isArchived" = FALSE
    `;

    const result = await dbClient.mainPool.query(query, [permissionId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new permission
   */
  static async createPermission(
    dbClient: dbClientPool,
    {
      permissionData,
      userId,
    }: {
      permissionData: CreatePermissionSchema;
      userId?: number;
    }
  ): Promise<number> {
    // Check if permission name already exists
    const existingPermission = await dbClient.mainPool.query(
      `SELECT id FROM permissions WHERE name = $1 AND "isArchived" = FALSE`,
      [permissionData.name]
    );

    if (existingPermission.rows.length > 0) {
      throw {
        statusCode: 400,
        message: "Permission with this name already exists",
      };
    }

    // Insert permission
    const query = `
      INSERT INTO permissions (name, label, description, "sortOrder", "isSystem", "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id
    `;

    const result = await dbClient.mainPool.query(query, [
      permissionData.name,
      permissionData.label,
      permissionData.description || null,
      permissionData.sortOrder || 0,
      permissionData.isSystem || false,
      userId || null,
    ]);

    return result.rows[0].id;
  }

  /**
   * Update a permission
   */
  static async updatePermission(
    dbClient: dbClientPool,
    {
      permissionId,
      permissionData,
      userId,
    }: {
      permissionId: number;
      permissionData: UpdatePermissionSchema;
      userId?: number;
    }
  ): Promise<void> {
    // Check if permission exists
    const existingPermission = await this.getPermissionById(
      dbClient,
      permissionId
    );
    if (!existingPermission) {
      throw { statusCode: 404, message: "Permission not found" };
    }

    // Check if name is being updated and if it conflicts
    if (
      permissionData.name &&
      permissionData.name !== existingPermission.name
    ) {
      const nameConflict = await dbClient.mainPool.query(
        `SELECT id FROM permissions WHERE name = $1 AND id != $2 AND "isArchived" = FALSE`,
        [permissionData.name, permissionId]
      );

      if (nameConflict.rows.length > 0) {
        throw {
          statusCode: 400,
          message: "Permission with this name already exists",
        };
      }
    }

    // Build update fields
    const acceptedKeys = [
      "name",
      "label",
      "description",
      "sortOrder",
      "isSystem",
    ];
    const updateFields = buildUpdateFields(acceptedKeys, permissionData);

    if (Object.keys(updateFields).length > 0) {
      // Add updatedBy and updatedAt
      updateFields["updatedBy"] = userId ? `${userId}` : "NULL";
      updateFields["updatedAt"] = "NOW()";

      const setQueryString = Object.entries(updateFields)
        .map(([key, value]) => `"${key}" = ${value}`)
        .join(", ");

      const updateQuery = `
        UPDATE permissions
        SET ${setQueryString}
        WHERE id = $1 AND "isArchived" = FALSE
      `;

      await dbClient.mainPool.query(updateQuery, [permissionId]);
    }
  }

  /**
   * Delete (archive) a permission
   */
  static async deletePermission(
    dbClient: dbClientPool,
    {
      permissionId,
      userId,
    }: {
      permissionId: number;
      userId?: number;
    }
  ): Promise<void> {
    const existingPermission = await this.getPermissionById(
      dbClient,
      permissionId
    );
    if (!existingPermission) {
      throw { statusCode: 404, message: "Permission not found" };
    }

    if (existingPermission.isSystem) {
      throw {
        statusCode: 400,
        message: "System permissions cannot be deleted",
      };
    }

    // Archive the permission
    await dbClient.mainPool.query(
      `UPDATE permissions 
       SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
       WHERE id = $2`,
      [userId || null, permissionId]
    );

    // Archive all role-permission mappings
    await dbClient.mainPool.query(
      `UPDATE role_permissions_xref 
       SET "isArchived" = TRUE, "archivedAt" = NOW(), "archivedBy" = $1
       WHERE "permissionId" = $2 AND "isArchived" = FALSE`,
      [userId || null, permissionId]
    );
  }

  /**
   * Get platform user roles and permissions from main schema
   * Returns both roles and permissions for the platform
   */
  static async getPlatformUserRolesAndPermissions(
    dbClient: dbClientPool,
    userId: number
  ): Promise<RolesAndPermissionsSchema> {
    // Get platform roles from main schema
    const rolesResult = await dbClient.mainPool.query(
      `
      SELECT r.id, r.name, r.label
      FROM roles r
      INNER JOIN user_roles_xref urx ON r.id = urx."roleId" AND urx."isArchived" = FALSE
      WHERE urx."userId" = $1 
        AND r."isArchived" = FALSE
    `,
      [userId]
    );
    const roles = rolesResult.rows;

    // Get platform permissions from main schema
    const permissionsResult = await dbClient.mainPool.query(
      `
      SELECT DISTINCT p.id, p.name, p.label
      FROM permissions p
      INNER JOIN role_permissions_xref rpx ON p.id = rpx."permissionId" AND rpx."isArchived" = FALSE
      INNER JOIN user_roles_xref urx ON rpx."roleId" = urx."roleId" AND urx."isArchived" = FALSE
      WHERE urx."userId" = $1 
        AND p."isArchived" = FALSE
    `,
      [userId]
    );

    const permissions = permissionsResult.rows;

    return { roles, permissions };
  }

  /**
   * Get tenant user roles and permissions from tenant schema
   * Requires tenantPool to be available in dbClient
   * Returns both roles and permissions for the tenant
   */
  static async getTenantUserRolesAndPermissions(
    dbClient: dbClientPool,
    userId: number
  ): Promise<RolesAndPermissionsSchema> {
    if (!dbClient.tenantPool) {
      // If tenantPool is not available, return empty arrays
      return { roles: [], permissions: [] };
    }

    try {
      // Get tenant roles from tenant schema
      const rolesResult = await dbClient.tenantPool.query(
        `
        SELECT r.id, r.name, r.label
        FROM roles r
        INNER JOIN user_roles_xref urx ON r.id = urx."roleId" AND urx."isArchived" = FALSE
        WHERE urx."userId" = $1 
          AND r."isArchived" = FALSE
      `,
        [userId]
      );
      const roles = rolesResult.rows;

      // Get tenant permissions from tenant schema
      const permissionsResult = await dbClient.tenantPool.query(
        `
        SELECT DISTINCT p.id, p.name, p.label
        FROM permissions p
        INNER JOIN role_permissions_xref rpx ON p.id = rpx."permissionId" AND rpx."isArchived" = FALSE
        INNER JOIN user_roles_xref urx ON rpx."roleId" = urx."roleId" AND urx."isArchived" = FALSE
        WHERE urx."userId" = $1 
          AND p."isArchived" = FALSE
      `,
        [userId]
      );
      const permissions = permissionsResult.rows;

      return { roles, permissions };
    } catch (error) {
      // If tenant schema doesn't have permissions/roles tables yet, silently continue
      // This allows the system to work with platform permissions only
      return { roles: [], permissions: [] };
    }
  }
}
