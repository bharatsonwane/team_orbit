-- ==================== CHAT SYSTEM TABLES ====================
-- ENUM TYPE FOR CHAT CHANNEL
DO $$ BEGIN CREATE TYPE chat_channel_type_enum AS ENUM ('direct', 'group');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ===========================================================
-- CHAT CHANNEL
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_channel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type chat_channel_type_enum NOT NULL,
    description TEXT,
    image VARCHAR(255),
    "createdBy" INT REFERENCES main.users (id) ON DELETE
    SET NULL,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "isActive" BOOLEAN DEFAULT TRUE NOT NULL
);
-- ===========================================================
-- CHAT CHANNEL - USER MAPPING
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_channel_user_mapping (
    id SERIAL PRIMARY KEY,
    "chatChannelId" INT NOT NULL REFERENCES chat_channel (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "isAdmin" BOOLEAN DEFAULT FALSE NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "isMuted" BOOLEAN DEFAULT FALSE NOT NULL,
    "lastReadAt" TIMESTAMP,
    "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "leftAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_chat_channel_user UNIQUE ("chatChannelId", "userId")
);
-- ===========================================================
-- CHAT MESSAGE (Partition Ready)
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGSERIAL,
    "chatChannelId" INT NOT NULL REFERENCES chat_channel (id) ON DELETE CASCADE,
    "senderId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "replyToMessageId" BIGINT,
    text TEXT,
    "mediaUrl" VARCHAR(500),
    "isEdited" BOOLEAN DEFAULT FALSE NOT NULL,
    "isDeleted" BOOLEAN DEFAULT FALSE NOT NULL,
    "deletedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id, "createdAt")
) PARTITION BY RANGE ("createdAt");
-- ===========================================================
-- Check if the chat message partition exists, and create it if missing
-- ===========================================================
CREATE OR REPLACE FUNCTION ensure_chat_message_partition_exists() RETURNS TRIGGER AS $$
DECLARE partitionName TEXT;
monthStart TIMESTAMP;
nextMonthStart TIMESTAMP;
BEGIN -- Calculate the start of the month for the message's createdAt
monthStart := date_trunc('month', NEW."createdAt");
-- Calculate the start of the next month
nextMonthStart := monthStart + INTERVAL '1 month';
-- Generate partition name (e.g., chat_message_2024_01)
partitionName := 'chat_message_' || to_char(monthStart, 'YYYY_MM');
-- Check if partition exists
IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = partitionName
) THEN -- Create the partition
EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF chat_message
            FOR VALUES FROM (%L) TO (%L);',
    partitionName,
    monthStart,
    nextMonthStart
);
RAISE NOTICE 'Auto-created missing partition: %',
partitionName;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ===========================================================
-- Attach the trigger to the chat message table
-- ===========================================================
DROP TRIGGER IF EXISTS trg_chat_message_partition_check ON chat_message;
CREATE TRIGGER trg_chat_message_partition_check BEFORE
INSERT ON chat_message FOR EACH ROW EXECUTE FUNCTION ensure_chat_message_partition_exists();
-- ===========================================================
-- CHAT MESSAGE STATUS (Per-User Delivered / Read)
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_message_status (
    id SERIAL PRIMARY KEY,
    "messageId" BIGINT NOT NULL,
    "messageCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "deliveredAt" TIMESTAMP,
    "readAt" TIMESTAMP,
    CONSTRAINT fk_chat_message_status_message FOREIGN KEY ("messageId", "messageCreatedAt") REFERENCES chat_message (id, "createdAt") ON DELETE CASCADE,
    CONSTRAINT unique_message_user_status UNIQUE ("messageId", "messageCreatedAt", "userId")
);
-- ===========================================================
-- CHAT MESSAGE REACTIONS
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_message_reaction (
    id SERIAL PRIMARY KEY,
    "messageId" BIGINT NOT NULL,
    "messageCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_chat_message_reaction_message FOREIGN KEY ("messageId", "messageCreatedAt") REFERENCES chat_message (id, "createdAt") ON DELETE CASCADE,
    CONSTRAINT unique_message_reaction UNIQUE ("messageId", "messageCreatedAt", "userId")
);