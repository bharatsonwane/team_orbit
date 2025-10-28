import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

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
  statusCode?: number;
  schema: any;
  description?: string;
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
        "application/json": {
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
          "application/json": {
            schema: schema,
          },
        },
      };
    }
  });
  return responses;
}

export const oasRegistry = new OpenAPIRegistry();

export const oasRegisterSchemas = (
  schemaList: { schemaName: string; schema: z.ZodSchema }[]
) => {
  schemaList.forEach(schema => {
    oasRegistry.register(schema.schemaName, schema.schema);
  });
};

export const requestHeaderNameKeys = {
  X_TENANT: "x-tenant",
  AUTHORIZATION: "authorization",
};

export const bearerAuth = oasRegistry.registerComponent(
  "securitySchemes",
  "authorization",
  {
    name: "authorization",
    type: "http",
    scheme: "bearer",
    description: "Tenant schema identifier for multi-tenant operations",
  }
);

export const tenantSchemaHeader = oasRegistry.registerComponent(
  "securitySchemes",
  "x-tenant",
  {
    name: "x-tenant",
    type: "apiKey",
    in: "header",
    description: "Tenant schema identifier for multi-tenant operations",
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
  let paramsSchema = requestSchema?.paramsSchema;
  const bodySchema = requestSchema?.bodySchema;
  const querySchema = requestSchema?.querySchema;
  const description = requestSchema?.description || "common document creator";

  // Auto-generate missing parameter schemas from route path
  const paramMatches = routePath.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g);
  if (paramMatches && paramMatches.length > 0) {
    // Initialize paramsSchema if it doesn't exist
    if (!paramsSchema) {
      paramsSchema = {};
    }

    // Add missing parameter schemas
    paramMatches.forEach(match => {
      const paramName = match.slice(1, -1); // Remove { and }
      if (paramsSchema && !paramsSchema[paramName]) {
        paramsSchema[paramName] = z
          .string()
          .min(1, "Parameter cannot be empty")
          .max(255, "Parameter cannot exceed 255 characters");
      }
    });
  }
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
              "application/json": { schema: bodySchema },
            },
          }
        : undefined,

      query: querySchema ? querySchema : undefined,
    },
    responses: {},
  };

  // api request type which is not a get request
  const responses: Record<string, any> = {};
  responseSchemas.forEach(
    ({ schema, description = "", statusCode = StatusCodes.OK }) => {
      if (schema && statusCode !== undefined) {
        responses[statusCode] = {
          description,
          content: {
            "application/json": {
              schema: schema,
            },
          },
        };
      }
    }
  );

  config.responses = responses;

  if (security) {
    config.security = security;
  }

  oasRegistry.registerPath({ ...config });
};

extendZodWithOpenApi(z);

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(oasRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/docs/swagger.json",
    },
  });
}
