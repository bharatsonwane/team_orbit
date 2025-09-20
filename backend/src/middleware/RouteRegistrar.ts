import express, { Router, RequestHandler } from 'express';
import { validateRequest } from './validationMiddleware';
import {
  bearerAuth,
  docRegistry,
} from '../openApiSpecification/openAPIDocumentGenerator';
import { commonDocCreator } from '../openApiSpecification/openAPIDocumentGenerator';

interface RouteOptions {
  middleware?: RequestHandler[];
  controller: RequestHandler;
  oasSchema?: (config: OpenApiDocConfig) => void;
  requestSchema?: {
    bodySchema?: any;
    querySchema?: any;
    paramsSchema?: any;
  };
  responseSchemas?: any;
}

interface OpenApiDocConfig {
  routePath: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  tags: string[];
  requestSchema?: any;
  responseSchemas?: any;
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

  constructor({ basePath = '', tags = [] }: ConstructorOptions) {
    this.router = express.Router();
    this.basePath = basePath;
    this.tags = tags;
  }

  registerRoute(
    method: string,
    path: string,
    {
      middleware = [],
      controller,
      oasSchema,
      requestSchema,
      responseSchemas,
    }: RouteOptions
  ): void {
    const fullRoutePath = `${this.basePath}${path}`;

    const docFullPath = fullRoutePath.replace(/:\w+/g, '{id}');
    const middlewares: RequestHandler[] = [];

    const openApiDocConfig: OpenApiDocConfig = {
      routePath: docFullPath,
      method: method as 'get' | 'post' | 'put' | 'delete' | 'patch',
      tags: this.tags,
      requestSchema,
      responseSchemas,
    };

    if (middleware?.length > 0) {
      openApiDocConfig.security = [{ [bearerAuth.name]: [] }];
    }

    if (oasSchema) {
      // Check if middleware is present in the middleware array
      oasSchema(openApiDocConfig);
    } else {
      commonDocCreator(openApiDocConfig);
    }

    if (requestSchema) {
      const { bodySchema, querySchema, paramsSchema } = requestSchema;
      middlewares.push(
        validateRequest({ bodySchema, querySchema, paramsSchema })
      );
    }

    if (middleware?.length > 0) {
      middlewares.push(...middleware);
    }

    middlewares.push(controller);

    (this.router as any)[method](path, ...middlewares);
  }

  get(path: string, options: RouteOptions): void {
    this.registerRoute('get', path, options);
  }

  post(path: string, options: RouteOptions): void {
    this.registerRoute('post', path, options);
  }

  put(path: string, options: RouteOptions): void {
    this.registerRoute('put', path, options);
  }

  delete(path: string, options: RouteOptions): void {
    this.registerRoute('delete', path, options);
  }

  patch(path: string, options: RouteOptions): void {
    this.registerRoute('patch', path, options);
  }
}

export default RouteRegistrar;
