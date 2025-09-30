-- chat_channel_type_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_channel_type_enum') THEN
        CREATE TYPE chat_channel_type_enum AS ENUM ('one_to_one', 'group');
    END IF;
END $$;

-- chat_channel Table
CREATE TABLE IF NOT EXISTS chat_channel (
    id SERIAL PRIMARY KEY,
    type chat_channel_type_enum NOT NULL, -- ENUM for chat channel type
    description TEXT, -- Chat channel description
    image VARCHAR(255), -- Image URL for the chat channel
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL -- Indicates if the chat channel is active
);

-- user_chat_channel_mapping Table
CREATE TABLE IF NOT EXISTS chat_channel_user_mapping (
    id SERIAL PRIMARY KEY,
    "chatChannelId" INT NOT NULL, -- Foreign key to chat_channel table
    "userId" INT NOT NULL, -- Foreign key to app_user table
    "isAdmin" BOOLEAN DEFAULT FALSE NOT NULL, -- Indicates if the user is an admin in the chat channel
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL, -- Indicates if the mapping is active
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_chat_channel FOREIGN KEY ("chatChannelId") REFERENCES chat_channel (id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES main.app_user (id) ON DELETE CASCADE,
    CONSTRAINT unique_chat_channel_user UNIQUE ("chatChannelId", "userId")
);

-- chat_message Table
CREATE TABLE IF NOT EXISTS chat_message (
    id SERIAL PRIMARY KEY,
    text TEXT, -- Message text content
    media VARCHAR(255), -- Media URL or file path
    "isEdited" BOOLEAN DEFAULT FALSE NOT NULL, -- Indicates if the message is edited
    "isDeleted" BOOLEAN DEFAULT FALSE NOT NULL, -- Indicates if the message is deleted
    "deliveredTo" JSON, -- JSON array storing who the message is delivered to
    "readBy" JSON, -- JSON array storing who has read the message
    reaction JSON, -- JSON storing reactions to the message
    "chatChannelId" INT NOT NULL, -- Foreign key to chat_channel table
    "senderId" INT NOT NULL, -- Foreign key to app_user table
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_chat_channel FOREIGN KEY ("chatChannelId") REFERENCES chat_channel (id) ON DELETE CASCADE,
    CONSTRAINT fk_sender_user FOREIGN KEY ("senderId") REFERENCES main.app_user (id) ON DELETE CASCADE
);
