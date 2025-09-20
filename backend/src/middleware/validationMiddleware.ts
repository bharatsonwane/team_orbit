import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { ServiceResponse } from '../openApiSpecification/serviceResponse';

interface ValidationSchemas {
  paramsSchema?: Record<string, z.ZodSchema>;
  querySchema?: z.ZodSchema | null;
  bodySchema?: z.ZodSchema | null;
}

interface ServiceResponseType {
  statusCode: number;
  [key: string]: any;
}

export const handleServiceResponse = (
  serviceResponse: ServiceResponseType,
  response: Response
): Response => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest =
  ({
    paramsSchema = {},
    querySchema = null,
    bodySchema = null,
  }: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (Object.keys(paramsSchema)?.length > 0) {
        Object.entries(paramsSchema).forEach(([key, schema]) => {
          schema.parse(req.params[key]);
        });
      }

      if (querySchema) {
        querySchema.parse(req.query);
      }
      if (bodySchema) {
        bodySchema.parse(req.body);
      }
      // schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err: any) {
      const errorMessage = `Invalid input: ${err.errors
        .map((e: any) => e.message)
        .join(', ')}`;
      const statusCode = StatusCodes.BAD_REQUEST;
      const serviceResponse = ServiceResponse.failure(
        errorMessage,
        null,
        statusCode
      );
      handleServiceResponse(serviceResponse, res);
    }
  };
