import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';

interface ApiResponseConfig {
  schema: any;
  description: string;
  statusCode?: number;
}

interface RequestSchema {
  paramsSchema?: Record<string, z.ZodSchema>;
  bodySchema?: z.ZodSchema;
  querySchema?: z.ZodSchema;
  description?: string;
}

interface ResponseSchema {
  schema: any;
  description?: string;
  statusCode?: number;
}

interface CommonDocCreatorConfig {
  routePath: string;
  method: string;
  tags: string[];
  requestSchema?: RequestSchema;
  responseSchemas?: ResponseSchema[];
  security?: Array<Record<string, string[]>>;
}

export function createApiResponse(
  schema: any,
  description: string,
  statusCode: number = StatusCodes.OK
) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: schema,
        },
      },
    },
  };
}

export function createApiResponses(configs: ApiResponseConfig[]) {
  const responses: Record<string, any> = {};
  configs.forEach(({ schema, description, statusCode }) => {
    if (statusCode !== undefined) {
      responses[statusCode] = {
        description,
        content: {
          'application/json': {
            schema: schema,
          },
        },
      };
    }
  });
  return responses;
}

export const docRegistry = new OpenAPIRegistry();

export const bearerAuth = docRegistry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
);

export const commonDocCreator = ({
  routePath,
  method,
  tags,
  requestSchema,
  responseSchemas = [],
  security,
}: CommonDocCreatorConfig): void => {
  const paramsSchema = requestSchema?.paramsSchema;
  const bodySchema = requestSchema?.bodySchema;
  const querySchema = requestSchema?.querySchema;
  const description = requestSchema?.description || 'common document creator';

  const config: any = {
    method: method,
    path: routePath,
    tags: tags,
    request: {
      params: paramsSchema ? z.object(paramsSchema) : undefined,
      body: bodySchema
        ? {
            description: description,
            content: {
              'application/json': { schema: bodySchema },
            },
          }
        : undefined,

      query: querySchema ? querySchema : undefined,
    },
    responses: {},
  };

  // api request type which is not a get request
  if (method === 'post' || method === 'put' || method === 'patch') {
    const responses: Record<string, any> = {};
    responseSchemas.forEach(
      ({ schema, description = 'Success', statusCode = StatusCodes.OK }) => {
        if (schema && statusCode !== undefined) {
          responses[statusCode] = {
            description,
            content: {
              'application/json': {
                schema: schema,
              },
            },
          };
        }
      }
    );

    config.responses = responses;
  }

  if (security) {
    config.security = security;
  }

  docRegistry.registerPath({ ...config });
};

extendZodWithOpenApi(z);

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(docRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/docs/swagger.json',
    },
  });
}
