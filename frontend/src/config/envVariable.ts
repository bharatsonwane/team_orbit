import { z } from 'zod';
import { logger } from '../utils/logger';

const envVariableSchema = z.object({
  /* app */
  APP_NAME: z.string().min(1, 'APP_NAME is mandatory'),
  APP_VERSION: z.string().min(1, 'APP_VERSION is mandatory'),
  APP_ENV: z.enum(['development', 'production', 'test']),

  /* api */
  API_BASE_URL: z.string().url({ message: 'API_BASE_URL must be a valid URL' }),
  API_TIMEOUT: z.number().int().positive().optional().default(10000),

  /* auth */
  JWT_STORAGE_KEY: z.string().min(1, 'JWT_STORAGE_KEY is mandatory'),
  TOKEN_EXPIRY_BUFFER: z.number().int().positive().optional().default(300000), // 5 minutes

  /* features */
  ENABLE_DEV_TOOLS: z.boolean().optional().default(false),
  ENABLE_ANALYTICS: z.boolean().optional().default(false),
  ENABLE_ERROR_REPORTING: z.boolean().optional().default(false),

  /* external services */
  GOOGLE_ANALYTICS_ID: z.string().optional(),
});

// Type inference from the schema
type EnvVariable = z.infer<typeof envVariableSchema>;

const getEnvVariable = (): EnvVariable => {
  try {
    // Get all environment variables at once
    const env = import.meta.env;

    const environmentVariable: EnvVariable = {
      APP_NAME: env.APP_NAME || 'TeamOrbit',
      APP_VERSION: env.APP_VERSION || '1.0.0',
      APP_ENV: (env.APP_ENV as EnvVariable['APP_ENV']) || 'development',
      API_BASE_URL: env.API_BASE_URL || 'http://localhost:5100',
      API_TIMEOUT: Number(env.API_TIMEOUT) || 10000,
      JWT_STORAGE_KEY: env.JWT_STORAGE_KEY || 'auth_token',
      TOKEN_EXPIRY_BUFFER: Number(env.TOKEN_EXPIRY_BUFFER) || 300000,
      ENABLE_DEV_TOOLS: env.ENABLE_DEV_TOOLS === 'true',
      ENABLE_ANALYTICS: env.ENABLE_ANALYTICS === 'true',
      ENABLE_ERROR_REPORTING: env.ENABLE_ERROR_REPORTING === 'true',
      GOOGLE_ANALYTICS_ID: env.GOOGLE_ANALYTICS_ID || '',
    };

    envVariableSchema.parse(environmentVariable);
    return environmentVariable;
  } catch (error) {
    logger.error(error);
    throw new Error('Environment variable validation failed');
  }
};

export const envVariable = getEnvVariable();
export type { EnvVariable };
