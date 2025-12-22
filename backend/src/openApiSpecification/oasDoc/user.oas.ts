import { z } from "zod";
import {
  createApiResponse,
  oasRegistry,
} from "../../openApiSpecification/openAPIDocumentGenerator";
import {
  baseUserSchema,
  userUpdatePasswordSchema,
} from "../../schemaTypes/user.schemaTypes";
import { idSchema } from "../../schemaTypes/common.schemaTypes";

interface DocConfig {
  routePath: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  tags: string[];
  security?: Array<Record<string, string[]>>;
}

/** @description Query schema for user list filtering, pagination and search */
export const getUsersQuerySchema = z.object({
  userType: z.enum(["platform", "tenant"]).optional(),
  roleCategory: z.enum(["PLATFORM", "TENANT"]).optional(),
  statusId: z.coerce.number().optional(),
  // 🔍 Add search and pagination
  searchText: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**@description Get User open api specification */
export const getUserOASSchema = ({
  routePath,
  method,
  tags,
  security,
}: DocConfig): void => {
  oasRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    summary: "Get users with optional filtering",
    description:
      "Retrieve users filtered by role category (PLATFORM or TENANT), tenant ID, or status ID",
    request: { query: getUsersQuerySchema },
    responses: createApiResponse(
      z.array(baseUserSchema),
      "Users retrieved successfully"
    ),
  });
};

/**@description Get User Profile open api specification */
export const getUserProfileOASSchema = ({
  routePath,
  method,
  tags,
  security,
}: DocConfig): void => {
  oasRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    summary: "Get authenticated user profile",
    description:
      "Retrieve the profile information of the currently authenticated user including roles",
    responses: createApiResponse(
      z.object({
        user: baseUserSchema,
      }),
      "User profile retrieved successfully"
    ),
  });
};

/**@description Update User Password open api specification */
export const updateUserPasswordOASSchema = ({
  routePath,
  method,
  tags,
  security,
}: DocConfig): void => {
  oasRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    request: {
      params: idSchema.shape.params,
      body: {
        description: "User login",
        content: {
          "application/json": { schema: userUpdatePasswordSchema.openapi({}) },
        },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  });
};

/** test route with two query parameters */
export const TestQuerySchema = z.object({
  query1: z.string().min(1),
  query2: z.string().min(1),
});

/** test query open api specification */
export const testQueryOASSchema = ({
  routePath,
  method,
  tags,
}: Omit<DocConfig, "security">): void => {
  oasRegistry.registerPath({
    method,
    path: routePath,
    tags,
    request: { query: TestQuerySchema },
    responses: createApiResponse(z.object({ message: z.string() }), "Success"),
  });
};
