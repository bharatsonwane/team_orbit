-- lookup_types Table
CREATE TABLE IF NOT EXISTS lookup_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,  -- Internal name (e.g., 'USER_ROLE', 'USER_STATUS')
    label VARCHAR(255) NOT NULL,        -- Display label (e.g., 'User Role')
    "isSystem" BOOLEAN NOT NULL,        -- System values that cannot be deleted
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL, -- Soft delete instead of hard delete
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL
);

-- lookups Table
CREATE TABLE IF NOT EXISTS lookups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,              -- Internal name (e.g., 'USER_ROLE_PLATFORM_ADMIN', 'USER_STATUS_ACTIVE')
    label VARCHAR(255) NOT NULL,             -- Display label (e.g., 'Platform Admin', 'Active')
    category VARCHAR(100) DEFAULT NULL,      -- Category of the lookup value (e.g., 'PLATFORM', 'TENANT')
    description TEXT,                        -- Optional description for the lookup value
    "isSystem" BOOLEAN DEFAULT FALSE NOT NULL, -- System values that cannot be deleted
    "sortOrder" INT DEFAULT 0 NOT NULL,      -- For ordering items within a type
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL, -- Soft delete instead of hard delete
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    "lookupTypeId" INT NOT NULL,
    CONSTRAINT fk_lookups_lookup_types FOREIGN KEY ("lookupTypeId") REFERENCES lookup_types (id) ON DELETE CASCADE,
    CONSTRAINT unique_lookup_type_id_name UNIQUE ("lookupTypeId", name),                        -- Unique constraint for lookup type and name
    CONSTRAINT unique_lookup_type_id_label UNIQUE ("lookupTypeId", label)                       -- Unique constraint for lookup type and label
);

-- tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "statusId" INT NOT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    CONSTRAINT fk_tenants_status FOREIGN KEY ("statusId") REFERENCES lookups (id)
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
    title title_enum, -- Use ENUM type
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255),
    "maidenName" VARCHAR(255),
    gender gender_enum, -- Use ENUM type
    dob DATE,
    "bloodGroup" blood_group_enum, -- Use ENUM type
    "marriedStatus" married_status_enum,
    bio TEXT, -- User biography
    "isPlatformUser" BOOLEAN DEFAULT FALSE NOT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "statusId" INT NOT NULL, -- Use "lookupId"
    "tenantId" INT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    CONSTRAINT fk_users_tenants FOREIGN KEY ("tenantId") REFERENCES tenants (id),
    CONSTRAINT fk_users_status FOREIGN KEY ("statusId") REFERENCES lookups (id)
);

-- user_auths Table
CREATE TABLE IF NOT EXISTS user_auths (
    id SERIAL PRIMARY KEY,    
    "userId" INT NOT NULL,
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
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_auths_users FOREIGN KEY ("userId") REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT unique_user_auth_user UNIQUE ("userId")  -- One auth record per user
);

-- user_role_xref Table (junction table, kept singular for relationship clarity)
CREATE TABLE IF NOT EXISTS user_role_xref (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "roleId" INT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_role_xref_users FOREIGN KEY ("userId") REFERENCES users (id),
    CONSTRAINT fk_user_role_xref_lookups FOREIGN KEY ("roleId") REFERENCES lookups (id)
);