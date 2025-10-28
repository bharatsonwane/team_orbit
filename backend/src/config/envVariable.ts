import { z } from "zod";
import dotenv from "dotenv";
import logger from "@src/utils/logger";

dotenv.config();

const envVariableSchema = z.object({
  /* server */
  NODE_ENV: z.enum(["development", "production", "test"]),
  API_HOST: z.string().url({ message: "API_HOST must be a valid URL" }),
  API_PORT: z.number().int().positive(),

  /* database */
  DB_HOST: z.string().min(3, "DB_HOST is mandatory"),
  DB_USER: z.string().min(3, "DB_USER is mandatory"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is mandatory"),
  DB_NAME: z.string().min(1, "DB_NAME is mandatory"),
  DB_PORT: z.number().min(1, "DB_PORT is mandatory"),

  /* auth */
  JWT_SECRET: z.string().min(6, "JWT_SECRET is mandatory"),
  PLATFORM_SUPER_ADMIN_PASSWORD: z
    .string()
    .min(5, "PLATFORM_SUPER_ADMIN_PASSWORD is mandatory"),
});

// Type inference from the schema
type EnvVariable = z.infer<typeof envVariableSchema>;

const getEnvVariable = (): EnvVariable => {
  try {
    const environmentVariable: EnvVariable = {
      NODE_ENV: process.env.NODE_ENV as EnvVariable["NODE_ENV"],
      API_HOST: process.env.API_HOST!,
      API_PORT: Number(process.env.API_PORT) || 5100,
      DB_HOST: process.env.DB_HOST!,
      DB_USER: process.env.DB_USER!,
      DB_PASSWORD: process.env.DB_PASSWORD!,
      DB_NAME: process.env.DB_NAME!,
      DB_PORT: Number(process.env.DB_PORT) || 5432,
      JWT_SECRET: process.env.JWT_SECRET!,
      PLATFORM_SUPER_ADMIN_PASSWORD: process.env.PLATFORM_SUPER_ADMIN_PASSWORD!,
    };

    envVariableSchema.parse(environmentVariable);
    console.log("Loaded ENV values:");

    return environmentVariable;
  } catch (error) {
    logger.error(error);
    throw new Error("Environment variable validation failed");
  }
};

export const envVariable = getEnvVariable();
