import logger from "../utils/logger";
import { DbMigrationManager } from "./dbMigrationManager";

const main = async (): Promise<void> => {
  try {
    const migrationManager = new DbMigrationManager();
    await migrationManager.handleMigration();
  } catch (error) {
    logger.error("Fatal error in main function:", error);
    process.exit(1);
  } finally {
    logger.info("Migration script exiting...");
    process.exit();
  }
};

main();
