import { z } from 'zod';
import {
  createApiResponse,
  docRegistry,
} from '../../openApiSpecification/openAPIDocumentGenerator';
import { chatMessageSchema } from '../../schemas/chat.schema';


interface SendMessageDocConfig {
    routePath: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    tags: string[];
    security?: Array<Record<string, string[]>>;
  }
  
  export const sendMessageOASSchema = ({
    routePath,
    method,
    tags,
    security,
  }: SendMessageDocConfig): void => {
    docRegistry.registerPath({
      method,
      path: routePath,
      tags,
      security,
      request: {
        body: {
          description: 'Send one-to-one message',
          content: {
            'application/json': {
              schema: chatMessageSchema.openapi({}),
            },
          },
        },
      },
      responses: createApiResponse(
        z.object({
          id: z.string().uuid(),
          senderId: z.string().uuid(),
          receiverId: z.string().uuid(),
          message: z.string(),
          mediaUrl: z.string().optional(),
          timestamp: z.string(),
        }),
        'Message sent'
      ),
    });
  };
  