-- ==================== INTERNAL SOCIAL NETWORK TABLES ====================
-- ENUM TYPES FOR POST SYSTEM
DO $$ BEGIN CREATE TYPE post_type_enum AS ENUM ('post', 'announcement', 'poll');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN CREATE TYPE attachment_type_enum AS ENUM ('image', 'document', 'video');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN CREATE TYPE visibility_enum AS ENUM ('public', 'department', 'team', 'private');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================
-- POST (Partition Ready)
-- ===========================================================
CREATE TABLE IF NOT EXISTS post (
    id BIGSERIAL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    "postType" post_type_enum NOT NULL,
    text TEXT,
    "isEdited" BOOLEAN DEFAULT FALSE NOT NULL,
    "isPinned" BOOLEAN DEFAULT FALSE NOT NULL,
    "pinnedAt" TIMESTAMP,
    "pinnedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "visibility" visibility_enum DEFAULT 'public',
    "targetDepartmentId" INT REFERENCES tenant_lookups (id),
    "targetTeamId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    PRIMARY KEY (id, "createdAt")
) PARTITION BY RANGE ("createdAt");

-- ===========================================================
-- POST ATTACHMENT (Media files)
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_attachment (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "attachmentType" attachment_type_enum NOT NULL,
    "fileKey" VARCHAR(500) NOT NULL,
    "fileName" VARCHAR(255),
    "fileSize" BIGINT,
    "mimeType" VARCHAR(100),
    "thumbnailKey" VARCHAR(500),
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_attachment_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt")
);

-- ===========================================================
-- POST REACTION
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_reaction (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    reaction VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_reaction_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_user_reaction UNIQUE ("postId", "postCreatedAt", "userId")
);

-- ===========================================================
-- POST COMMENT (Partition Ready)
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_comment (
    id BIGSERIAL,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    "parentCommentId" BIGINT,
    "parentCommentCreatedAt" TIMESTAMP,
    text TEXT NOT NULL,
    "isEdited" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    PRIMARY KEY (id, "createdAt"),
    CONSTRAINT fk_post_comment_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT fk_post_comment_parent FOREIGN KEY ("parentCommentId", "parentCommentCreatedAt") REFERENCES post_comment (id, "createdAt")
) PARTITION BY RANGE ("createdAt");

-- ===========================================================
-- POST COMMENT REACTION
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_comment_reaction (
    id SERIAL PRIMARY KEY,
    "commentId" BIGINT NOT NULL,
    "commentCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    reaction VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_comment_reaction_comment FOREIGN KEY ("commentId", "commentCreatedAt") REFERENCES post_comment (id, "createdAt"),
    CONSTRAINT unique_comment_user_reaction UNIQUE ("commentId", "commentCreatedAt", "userId")
);

-- ===========================================================
-- POST POLL
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_poll (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "question" TEXT NOT NULL,
    "isMultipleChoice" BOOLEAN DEFAULT FALSE NOT NULL,
    "allowAddOptions" BOOLEAN DEFAULT FALSE NOT NULL,
    "endsAt" TIMESTAMP,
    "isClosed" BOOLEAN DEFAULT FALSE NOT NULL,
    "closedAt" TIMESTAMP,
    "closedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_poll_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_poll UNIQUE ("postId", "postCreatedAt")
);

-- ===========================================================
-- POST POLL OPTION
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_poll_option (
    id SERIAL PRIMARY KEY,
    "pollId" INT NOT NULL REFERENCES post_poll (id),
    text TEXT NOT NULL,
    "imageKey" VARCHAR(500),
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id)
);

-- ===========================================================
-- POST POLL VOTE
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_poll_vote (
    id SERIAL PRIMARY KEY,
    "pollId" INT NOT NULL REFERENCES post_poll (id),
    "optionId" INT NOT NULL REFERENCES post_poll_option (id),
    "userId" INT NOT NULL REFERENCES main.users(id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT unique_poll_user_option UNIQUE ("pollId", "userId", "optionId")
);

-- ===========================================================
-- POST HASHTAG
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_hashtag (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    hashtag VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_hashtag_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_hashtag UNIQUE ("postId", "postCreatedAt", hashtag)
);

-- ===========================================================
-- POST BOOKMARK
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_bookmark (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_bookmark_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_user_bookmark UNIQUE ("postId", "postCreatedAt", "userId")
);

-- ===========================================================
-- POST CATEGORY MAPPING (Using tenant_lookups)
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_category_xref (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "categoryId" INT NOT NULL REFERENCES tenant_lookups (id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_category_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_category UNIQUE ("postId", "postCreatedAt", "categoryId")
);

-- ===========================================================
-- POST MENTION
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_mention (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "mentionedUserId" INT NOT NULL REFERENCES main.users(id),
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_mention_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_mention UNIQUE ("postId", "postCreatedAt", "mentionedUserId")
);

-- ===========================================================
-- POST VIEW (Optional - for analytics)
-- ===========================================================
CREATE TABLE IF NOT EXISTS post_view (
    id SERIAL PRIMARY KEY,
    "postId" BIGINT NOT NULL,
    "postCreatedAt" TIMESTAMP NOT NULL,
    "userId" INT NOT NULL REFERENCES main.users(id),
    "viewedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),
    CONSTRAINT fk_post_view_post FOREIGN KEY ("postId", "postCreatedAt") REFERENCES post (id, "createdAt"),
    CONSTRAINT unique_post_user_view UNIQUE ("postId", "postCreatedAt", "userId")
);

-- ===========================================================
-- INDEXES
-- ===========================================================
-- Post indexes
CREATE INDEX IF NOT EXISTS idx_post_user_created ON post ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_post_type_created ON post ("postType", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_post_visibility ON post ("visibility", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_post_pinned ON post ("isPinned", "pinnedAt" DESC) WHERE "isPinned" = TRUE;
CREATE INDEX IF NOT EXISTS idx_post_archived ON post ("isArchived", "archivedAt") WHERE "isArchived" = FALSE;

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comment_post ON post_comment ("postId", "postCreatedAt", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_comment_parent ON post_comment ("parentCommentId", "parentCommentCreatedAt");
CREATE INDEX IF NOT EXISTS idx_comment_archived ON post_comment ("isArchived", "archivedAt") WHERE "isArchived" = FALSE;

-- Reaction indexes
CREATE INDEX IF NOT EXISTS idx_post_reaction_post ON post_reaction ("postId", "postCreatedAt");
CREATE INDEX IF NOT EXISTS idx_comment_reaction_comment ON post_comment_reaction ("commentId", "commentCreatedAt");

-- Bookmark indexes
CREATE INDEX IF NOT EXISTS idx_post_bookmark_user ON post_bookmark ("userId", "createdAt" DESC);

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_post_category_category ON post_category_xref ("categoryId", "createdAt" DESC);

-- Hashtag indexes
CREATE INDEX IF NOT EXISTS idx_post_hashtag_tag ON post_hashtag (hashtag, "createdAt" DESC);

