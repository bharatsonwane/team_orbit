import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export class ServiceResponse {
  public success: boolean;
  public message: string;
  public responseObject: any;
  public statusCode: number;

  constructor(
    success: boolean,
    message: string,
    responseObject: any,
    statusCode: number
  ) {
    this.success = success;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }

  static success(
    message: string,
    responseObject: any,
    statusCode: number = StatusCodes.OK
  ): ServiceResponse {
    return new ServiceResponse(true, message, responseObject, statusCode);
  }

  static failure(
    message: string,
    responseObject: any,
    statusCode: number = StatusCodes.BAD_REQUEST
  ): ServiceResponse {
    return new ServiceResponse(false, message, responseObject, statusCode);
  }
}

export const ServiceResponseSchema = (dataSchema: z.ZodSchema) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    responseObject: dataSchema.optional(),
    statusCode: z.number(),
  });
