import express, { Router, RequestHandler } from "express";
import { validateRequest } from "@src/middleware/validationMiddleware";
import {
  bearerAuth,
  tenantSchemaHeader,
} from "@src/openApiSpecification/openAPIDocumentGenerator";
import { commonDocCreator } from "@src/openApiSpecification/openAPIDocumentGenerator";

interface RouteOptions {
  middlewares?: RequestHandler[];
  controller: RequestHandler;
  oasSchema?: (config: OpenApiDocConfig) => void;
  requestSchema?: {
    bodySchema?: any;
    querySchema?: any;
    paramsSchema?: any;
  };
  responseSchemas?: { statusCode: number; schema: any }[];
}

interface OpenApiDocConfig {
  routePath: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  tags: string[];
  requestSchema?: any;
  responseSchemas?: { statusCode: number; schema: any }[];
  security?: Array<Record<string, string[]>>;
}

interface ConstructorOptions {
  basePath?: string;
  tags?: string[];
}

class RouteRegistrar {
  public router: Router;
  private basePath: string;
  private tags: string[];

  constructor({ basePath = "", tags = [] }: ConstructorOptions) {
    this.router = express.Router();
    this.basePath = basePath;
    this.tags = tags;
  }

  registerRoute(
    method: string,
    path: string,
    {
      middlewares = [],
      controller,
      oasSchema,
      requestSchema,
      responseSchemas,
    }: RouteOptions
  ): void {
    const fullRoutePath = `${this.basePath}${path}`;
    // Convert Express route parameters to OpenAPI format: :param -> {param}
    const docFullPath = fullRoutePath.replace(
      /:([a-zA-Z_][a-zA-Z0-9_]*)/g,
      "{$1}"
    );
    const middlewareList: RequestHandler[] = [];

    const openApiDocConfig: OpenApiDocConfig = {
      routePath: docFullPath,
      method: method as "get" | "post" | "put" | "delete" | "patch",
      tags: this.tags,
      requestSchema,
      responseSchemas,
    };
    if (middlewares?.length > 0) {
      const securityObject: Record<string, string[]> = {};

      // Check middleware function names to determine security schemes
      middlewares?.forEach(middleware => {
        const functionName = middleware.name;

        if (functionName === "validateAuthRoles") {
          securityObject[bearerAuth.name] = [];
        } else if (functionName === "validateTenantHeader") {
          securityObject[tenantSchemaHeader.name] = [];
        }
      });

      openApiDocConfig.security = [securityObject];
    }

    if (oasSchema) {
      // Check if middleware is present in the middleware array
      oasSchema(openApiDocConfig);
    } else {
      commonDocCreator(openApiDocConfig);
    }

    if (requestSchema) {
      const { bodySchema, querySchema, paramsSchema } = requestSchema;
      middlewareList.push(
        validateRequest({ bodySchema, querySchema, paramsSchema })
      );
    }

    if (middlewares?.length > 0) {
      middlewareList.push(...middlewares);
    }

    middlewareList.push(controller);

    (this.router as any)[method](path, ...middlewareList);
  }

  get(path: string, options: RouteOptions): void {
    this.registerRoute("get", path, options);
  }

  post(path: string, options: RouteOptions): void {
    this.registerRoute("post", path, options);
  }

  put(path: string, options: RouteOptions): void {
    this.registerRoute("put", path, options);
  }

  delete(path: string, options: RouteOptions): void {
    this.registerRoute("delete", path, options);
  }

  patch(path: string, options: RouteOptions): void {
    this.registerRoute("patch", path, options);
  }
}

export default RouteRegistrar;
