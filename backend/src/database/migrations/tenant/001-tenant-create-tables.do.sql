-- chat_channel_type_enum Type
DO $$ BEGIN
    CREATE TYPE chat_channel_type_enum AS ENUM ('one_to_one', 'group');
EXCEPTION
    WHEN duplicate_object THEN null;
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
    "userId" INT NOT NULL, -- Foreign key to user table
    "isAdmin" BOOLEAN DEFAULT FALSE NOT NULL, -- Indicates if the user is an admin in the chat channel
    "isActive" BOOLEAN DEFAULT TRUE NOT NULL, -- Indicates if the mapping is active
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_chat_channel FOREIGN KEY ("chatChannelId") REFERENCES chat_channel (id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES main.users (id) ON DELETE CASCADE,
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
    "senderId" INT NOT NULL, -- Foreign key to user table
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_chat_channel FOREIGN KEY ("chatChannelId") REFERENCES chat_channel (id) ON DELETE CASCADE,
    CONSTRAINT fk_sender_user FOREIGN KEY ("senderId") REFERENCES main.users (id) ON DELETE CASCADE
);

-- user_contacts Table (stores different contact types per tenant)
CREATE TABLE IF NOT EXISTS user_contacts (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL, -- Foreign key to main.users table
    "contactTypeId" INT NOT NULL, -- Foreign key to main.lookups (CONTACT_TYPE)
    value VARCHAR(255) NOT NULL, -- The actual contact value (email or phone)
    "isPrimary" BOOLEAN DEFAULT FALSE NOT NULL, -- Is this the primary contact of this type
    "isVerified" BOOLEAN DEFAULT FALSE NOT NULL, -- Is this contact verified
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_contacts_user FOREIGN KEY ("userId") REFERENCES main.users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_contacts_contact_type FOREIGN KEY ("contactTypeId") REFERENCES main.lookups (id),
    CONSTRAINT unique_user_contact_type_value UNIQUE ("userId", "contactTypeId", value) -- Same user can't have duplicate contacts
);

-- user_job_details Table (stores job-related information per tenant)
CREATE TABLE IF NOT EXISTS user_job_details (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL, -- Foreign key to main.users table
    "hiringDate" DATE,
    "joiningDate" DATE,
    "probationPeriodMonths" INT,
    "designation" VARCHAR(255),
    "department" VARCHAR(255),
    "employeeId" VARCHAR(100) UNIQUE,
    "ctc" DECIMAL(15, 2),
    "reportingManagerId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_job_details_user FOREIGN KEY ("userId") REFERENCES main.users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_job_details_manager FOREIGN KEY ("reportingManagerId") REFERENCES main.users (id) ON DELETE SET NULL,
    CONSTRAINT unique_user_job_details UNIQUE ("userId") -- One job detail record per user
);
