import { z } from 'zod';
import {
  createApiResponse,
  docRegistry,
} from '../../openApiSpecification/openAPIDocumentGenerator';
import {
  userSchema,
  userUpdatePasswordSchema,
} from '../../schemas/user.schema';
import { idSchema } from '../../schemas/common.schema';

interface DocConfig {
  routePath: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  tags: string[];
  security?: Array<Record<string, string[]>>;
}

/**@description Get User open api specification */
export const getUserOASSchema = ({
  routePath,
  method,
  tags,
  security,
}: DocConfig): void => {
  docRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    responses: createApiResponse(z.array(userSchema), 'Success'),
  });
};

/**@description Get User Profile open api specification */
export const getUserProfileOASSchema = ({
  routePath,
  method,
  tags,
  security,
}: DocConfig): void => {
  docRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    summary: 'Get authenticated user profile',
    description:
      'Retrieve the profile information of the currently authenticated user including roles',
    responses: createApiResponse(
      z.object({
        user: userSchema,
      }),
      'User profile retrieved successfully'
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
  docRegistry.registerPath({
    method,
    path: routePath,
    tags,
    security,
    request: {
      params: idSchema.shape.params,
      body: {
        description: 'User login',
        content: {
          'application/json': { schema: userUpdatePasswordSchema.openapi({}) },
        },
      },
    },
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
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
}: Omit<DocConfig, 'security'>): void => {
  docRegistry.registerPath({
    method,
    path: routePath,
    tags,
    request: { query: TestQuerySchema },
    responses: createApiResponse(z.object({ message: z.string() }), 'Success'),
  });
};
