-- lookup_type Table
CREATE TABLE IF NOT EXISTS lookup_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,  -- Internal name (e.g., 'USER_ROLE')
    label VARCHAR(255) NOT NULL,        -- Display label (e.g., 'User Role')
    "isSystem" BOOLEAN NOT NULL,        -- System values that cannot be deleted
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL
);

-- lookup Table
CREATE TABLE IF NOT EXISTS lookup (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,              -- Internal name (e.g., 'ROLE_PLATFORM_ADMIN', 'STATUS_ACTIVE', 'ROLE_TENANT_ADMIN')
    label VARCHAR(255) NOT NULL,                    -- Display label (e.g., 'USER_ROLE_PLATFORM_ADMIN')
    "isSystem" BOOLEAN,                             -- System values that cannot be deleted
    "sortOrder" INT DEFAULT 0,                      -- For ordering items within a type
    "isArchived" BOOLEAN DEFAULT FALSE,             -- Soft delete instead of hard delete
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    "lookupTypeId" INT NOT NULL,
    CONSTRAINT fk_lookup_lookup_type FOREIGN KEY ("lookupTypeId") REFERENCES lookup_type (id),  -- Foreign key constraint
    CONSTRAINT unique_lookup_type_id_label UNIQUE ("lookupTypeId", label)                       -- Unique constraint for lookup type and label
);

-- tenant Table
CREATE TABLE IF NOT EXISTS tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL UNIQUE,
    "statusId" INT NOT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL,
    CONSTRAINT fk_tenant_status FOREIGN KEY ("statusId") REFERENCES lookup (id)
);

-- title_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'title_enum') THEN
        CREATE TYPE title_enum AS ENUM ('Mr', 'Mrs', 'Ms');
    END IF;
END $$;

-- gender_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
    END IF;
END $$;

-- blood_group_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blood_group_enum') THEN
        CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
    END IF;
END $$;

-- married_status_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'married_status_enum') THEN
        CREATE TYPE married_status_enum AS ENUM ( 'Single', 'Married', 'Divorced', 'Widowed');
    END IF;
END $$;

-- user Table
CREATE TABLE IF NOT EXISTS app_user (
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
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    "hashPassword" VARCHAR(255),  -- Store hashPassword
    "lastPasswordChangedAt" TIMESTAMP DEFAULT NULL,
    bio TEXT, -- User biography
    "statusId" INT NOT NULL, -- Use "lookupId"
    "tenantId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_tenant FOREIGN KEY ("tenantId") REFERENCES tenant (id),
    CONSTRAINT fk_user_user_status FOREIGN KEY ("statusId") REFERENCES lookup (id)
);

-- user_role_xref table
CREATE TABLE IF NOT EXISTS user_role_xref (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "roleId" INT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_role_xref_user FOREIGN KEY ("userId") REFERENCES app_user (id),
    CONSTRAINT fk_user_role_xref_role FOREIGN KEY ("roleId") REFERENCES lookup (id)
);