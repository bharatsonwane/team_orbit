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
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "lastActivityAt" TIMESTAMP DEFAULT NULL, -- Tracks last message activity (new message, edit, reaction, etc.)

    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id)
);
-- ===========================================================
-- CHAT CHANNEL - USER MAPPING
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_channel_user_xref (
    id SERIAL PRIMARY KEY,
    "chatChannelId" INT NOT NULL REFERENCES chat_channel (id) ON DELETE CASCADE,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "isAdmin" BOOLEAN DEFAULT FALSE NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
    "isNotificationsMuted" BOOLEAN DEFAULT FALSE NOT NULL,
    "lastReadAt" TIMESTAMP,
    "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "leftAt" TIMESTAMP,
    
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id),

    CONSTRAINT unique_chat_channel_user UNIQUE ("chatChannelId", "userId")
);
-- ===========================================================
-- CHAT MESSAGE (Partition Ready)
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGSERIAL,
    "chatChannelId" INT NOT NULL REFERENCES chat_channel (id) ON DELETE CASCADE,
    "senderUserId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "replyToMessageId" BIGINT,
    text TEXT,
    "mediaUrl" VARCHAR(500),
    "isEdited" BOOLEAN DEFAULT FALSE NOT NULL,
    "lastActivityAt" TIMESTAMP DEFAULT NULL, -- Tracks last message activity (new message, edit, reaction, etc.)
    
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id),

    PRIMARY KEY (id, "createdAt")
) PARTITION BY RANGE ("createdAt");
-- ===========================================================
-- CHAT MESSAGE STATUS (Per-User Delivered / Read)
-- ===========================================================
CREATE TABLE IF NOT EXISTS chat_message_receipt (
    id SERIAL PRIMARY KEY,
    "messageId" BIGINT NOT NULL,
    "messageCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users (id) ON DELETE CASCADE,
    "deliveredAt" TIMESTAMP,
    "readAt" TIMESTAMP,

    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id),

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
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id),

    CONSTRAINT fk_chat_message_reaction_message FOREIGN KEY ("messageId", "messageCreatedAt") REFERENCES chat_message (id, "createdAt") ON DELETE CASCADE,
    CONSTRAINT unique_message_reaction UNIQUE ("messageId", "messageCreatedAt", "userId")
);