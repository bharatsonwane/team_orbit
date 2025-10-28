import pg, { QueryResult } from "pg";
import { envVariable } from "../config/envVariable";
import logger from "../utils/logger";

const { Pool, Client } = pg;
type PoolClient = pg.PoolClient;
type PoolType = typeof Pool;
type ClientType = typeof Client;

export const schemaNames = {
  main: "main",
  tenantSchemaName: (tenantId: string) => `tenant_${tenantId}`,
  tenantSchemaFolderName: (tenantId: string) => `tenant`,
};

interface TransactionHandlers {
  pool: PoolClient;
  query: (query: string, params?: any[]) => Promise<QueryResult<any>>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

class DbManager {
  private client: InstanceType<ClientType> | null = null;
  private pool: InstanceType<PoolType> | null = null;

  async getDbClient(): Promise<InstanceType<ClientType>> {
    if (!this.client) {
      this.client = new Client({
        host: envVariable.DB_HOST,
        port: envVariable.DB_PORT,
        database: envVariable.DB_NAME,
        user: envVariable.DB_USER,
        password: envVariable.DB_PASSWORD,
      });
      await this.client.connect();
    }
    return this.client;
  }

  getDbPool(): InstanceType<PoolType> {
    if (!this.pool) {
      this.pool = new Pool({
        host: envVariable.DB_HOST,
        port: envVariable.DB_PORT,
        database: envVariable.DB_NAME,
        user: envVariable.DB_USER,
        password: envVariable.DB_PASSWORD,
        // Add connection pool configuration
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
      });

      // Handle pool errors
      this.pool.on("error", (err: Error, client: PoolClient) => {
        logger.error("Unexpected error on idle client", err);
      });
    }
    return this.pool;
  }

  async getSchemaPool(schemaName: string): Promise<PoolClient> {
    const pool = await this.getDbPool().connect();
    try {
      await pool.query(`SET search_path TO ${schemaName}`);
      return pool;
    } catch (error) {
      pool.release();
      logger.error(`Failed to set schema "${schemaName}"`, error);
      throw error;
    }
  }

  async transaction(schemaName: string): Promise<TransactionHandlers> {
    const pool = await this.getDbPool().connect();
    try {
      await pool.query(`SET search_path TO ${schemaName}`);
      await pool.query("BEGIN");

      const commit = async (): Promise<void> => {
        await pool.query("COMMIT");
        pool.release(true);
      };

      const rollback = async (): Promise<void> => {
        await pool.query("ROLLBACK");
        pool.release(true);
      };
      const query = pool.query;

      return { pool, query, commit, rollback };
    } catch (error) {
      pool.release(true);
      logger.error("Transaction Error:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.client) {
        await this.client.end();
        this.client = null;
      }
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }
      logger.info("Database connections closed successfully");
    } catch (error) {
      logger.error("Error during database shutdown:", error);
      throw error;
    }
  }
}

// Create a singleton instance
const db = new DbManager();

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await db.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
});

export default db;
