-- lookup_types Table
CREATE TABLE IF NOT EXISTS lookup_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,  -- Internal name (e.g., 'USER_ROLE', 'USER_STATUS')
    label VARCHAR(255) NOT NULL,        -- Display label (e.g., 'User Role')
    "isSystem" BOOLEAN NOT NULL,        -- System values that cannot be deleted
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL, -- Soft delete instead of hard delete
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL
);

-- lookups Table
CREATE TABLE IF NOT EXISTS lookups (
    id SERIAL PRIMARY KEY,
    "lookupTypeId" INT NOT NULL REFERENCES lookup_types (id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,         -- Internal name (e.g., 'USER_ROLE_ADMIN')
    label VARCHAR(255) NOT NULL,        -- Display label (e.g., 'Admin')
    category VARCHAR(100),              -- Optional grouping (e.g., 'PLATFORM', 'TENANT')
    description TEXT,                   -- Optional details or tooltip text

    "sortOrder" INT DEFAULT 0 NOT NULL, -- Used for ordering
    "isSystem" BOOLEAN DEFAULT FALSE,   -- System-managed (non-deletable)

    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE, -- Soft delete flag
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,

    CONSTRAINT unique_lookup_name_per_type UNIQUE ("lookupTypeId", name),
    CONSTRAINT unique_lookup_label_per_type UNIQUE ("lookupTypeId", label)
);


-- tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "statusId" INT NOT NULL REFERENCES lookups (id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL
);

-- title_enum Type
DO $$ 
BEGIN
    CREATE TYPE title_enum AS ENUM ('Mr', 'Mrs', 'Ms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- gender_enum Type  
DO $$ 
BEGIN
    CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- blood_group_enum Type
DO $$ 
BEGIN
    CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- married_status_enum Type
DO $$ 
BEGIN
    CREATE TYPE married_status_enum AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "tenantId" INT NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    title title_enum, -- Use ENUM type
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255),
    "maidenName" VARCHAR(255),
    gender gender_enum, -- Use ENUM type
    dob DATE,
    "bloodGroup" blood_group_enum, -- Use ENUM type
    "marriedStatus" married_status_enum,
    "profilePictureUrl" VARCHAR(500),
    bio TEXT, -- User biography
    "isPlatformUser" BOOLEAN DEFAULT FALSE NOT NULL,
    "statusId" INT NOT NULL REFERENCES lookups (id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id) ON DELETE SET NULL
);

-- user_auths Table
CREATE TABLE IF NOT EXISTS user_auths (
    id SERIAL PRIMARY KEY,    
    "userId" INT NOT NULL REFERENCES users (id) ON DELETE CASCADE UNIQUE,
    -- Local login
    "authEmail" VARCHAR(255) UNIQUE NOT NULL,  -- Office Email for authentication/login
    "authMobileNumber" VARCHAR(255) UNIQUE DEFAULT NULL,  -- Mobile Number for authentication/login
    "hashPassword" TEXT,        -- Store hashPassword   
    "passwordUpdatedAt" TIMESTAMP DEFAULT NULL,
    "otpCode" VARCHAR(10),
    "otpExpiresAt" TIMESTAMP,
    
    -- Third-party SSO
    "googleId" VARCHAR(255) UNIQUE,
    "outlookId" VARCHAR(255) UNIQUE,
    "appleId" VARCHAR(255) UNIQUE,  -- Apple Sign-In
    
    -- Audit
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);

-- user_role_xref Table (junction table, kept singular for relationship clarity)
CREATE TABLE IF NOT EXISTS user_role_xref (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    "roleId" INT NOT NULL REFERENCES lookups (id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users (id) ON DELETE SET NULL
);