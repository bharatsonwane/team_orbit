/* ============================================================
   LOOKUP TYPES TABLE e.g. userStatus, userLanguage
   ============================================================ */
CREATE TABLE lookup_types (
    id SERIAL PRIMARY KEY,

    name VARCHAR(255) UNIQUE NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL,
    "isSystem" BOOLEAN NOT NULL,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT,

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT
);

/* ============================================================
   LOOKUPS TABLE e.g. PENDING, ACTIVE, INACTIVE
   ============================================================ */
CREATE TABLE lookups (
    id SERIAL PRIMARY KEY,

    "lookupTypeId" INT NOT NULL
        REFERENCES lookup_types(id),

    name VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,

    "sortOrder" INT NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT,

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT,

    CONSTRAINT "uniqueLookupNamePerType" UNIQUE ("lookupTypeId", name),
    CONSTRAINT "uniqueLookupLabelPerType" UNIQUE ("lookupTypeId", label)
);

/* ============================================================
   Enums
   ============================================================ */
/* title_enum Type */
DO $$ 
BEGIN
    CREATE TYPE title_enum AS ENUM ('Mr', 'Mrs', 'Ms');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* gender_enum Type */
DO $$ 
BEGIN
    CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* blood_group_enum Type */
DO $$ 
BEGIN
    CREATE TYPE blood_group_enum AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* married_status_enum Type */
DO $$ 
BEGIN
    CREATE TYPE married_status_enum AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* ============================================================
   USERS TABLE
   ============================================================ */
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "tenantId" INT,
    title title_enum, -- Use ENUM type
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255),
    "maidenName" VARCHAR(255),
    gender gender_enum, -- Use ENUM type
    dob DATE,
    "bloodGroup" blood_group_enum, -- Use ENUM type
    "marriedStatus" married_status_enum,
    "profilePictureKey" VARCHAR(500),
    bio TEXT, -- User biography
    "isPlatformUser" BOOLEAN DEFAULT FALSE NOT NULL,
    "statusId" INT NOT NULL REFERENCES lookups (id),
    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id),
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id)
);

/* ============================================================
   FOREIGN KEY CONSTRAINTS
   Add foreign key constraints for lookup_types and lookups tables to users (using DEFERRABLE to handle circular dependency)
   These constraints are added after both tables are created to avoid circular dependency issues
   ============================================================ */
ALTER TABLE lookup_types
    ADD CONSTRAINT "fk_lookup_types_createdBy" 
        FOREIGN KEY ("createdBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE lookup_types
    ADD CONSTRAINT "fk_lookup_types_updatedBy" 
        FOREIGN KEY ("updatedBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE lookup_types
    ADD CONSTRAINT "fk_lookup_types_archivedBy" 
        FOREIGN KEY ("archivedBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;
        
ALTER TABLE lookups
    ADD CONSTRAINT "fk_lookups_createdBy" 
        FOREIGN KEY ("createdBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE lookups
    ADD CONSTRAINT "fk_lookups_updatedBy" 
        FOREIGN KEY ("updatedBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE lookups
    ADD CONSTRAINT "fk_lookups_archivedBy" 
        FOREIGN KEY ("archivedBy") REFERENCES users(id) 
        DEFERRABLE INITIALLY DEFERRED;

/* ============================================================
   USER AUTH TABLE
   ============================================================ */
CREATE TABLE IF NOT EXISTS user_auths (
    id SERIAL PRIMARY KEY,    
    "userId" INT NOT NULL REFERENCES users (id) UNIQUE,
    -- Local login
    "authEmail" VARCHAR(255) UNIQUE NOT NULL,  -- Office Email for authentication/login
    "authMobileNumber" VARCHAR(255) UNIQUE DEFAULT NULL,  -- Mobile Number for authentication/login
    "hashPassword" TEXT,        -- Store hashPassword   
    "passwordUpdatedAt" TIMESTAMPTZ DEFAULT NULL,
    "otpCode" VARCHAR(10),
    "otpExpiresAt" TIMESTAMPTZ,
    
    -- Third-party SSO
    "googleId" VARCHAR(255) UNIQUE,
    "outlookId" VARCHAR(255) UNIQUE,
    "appleId" VARCHAR(255) UNIQUE,  -- Apple Sign-In
    
    -- Audit
    "lastLoginAt" TIMESTAMPTZ,

    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id),

    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id),

    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id)
);

/* ============================================================
   ROLES TABLE
   ============================================================ */
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

    "sortOrder" INT NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT REFERENCES users(id),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT REFERENCES users(id),

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT REFERENCES users(id)
);

/* ============================================================
   PERMISSIONS TABLE
   ============================================================ */
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

    "sortOrder" INT NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT REFERENCES users(id),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT REFERENCES users(id),

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT REFERENCES users(id)
);
        
/* ============================================================
   USER ROLES XREF TABLE
   ============================================================ */
CREATE TABLE user_roles_xref (
    id SERIAL PRIMARY KEY,

    "userId" INT NOT NULL REFERENCES users(id),
    "roleId" INT NOT NULL REFERENCES roles(id),

    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id),

    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id),

    UNIQUE ("userId", "roleId")
);

/* ============================================================
   ROLE PERMISSIONS XREF
   ============================================================ */
CREATE TABLE role_permissions_xref (
    id SERIAL PRIMARY KEY,

    "roleId" INT NOT NULL REFERENCES roles(id),
    "permissionId" INT NOT NULL REFERENCES permissions(id),

    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id),

    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id),

    UNIQUE ("roleId", "permissionId")
);



/* ============================================================
   TENANTS TABLE
   ============================================================ */
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    "statusId" INT NOT NULL REFERENCES lookups (id),

    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES users (id),

    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES users (id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES users (id)
);

ALTER TABLE users
    ADD CONSTRAINT "fk_users_tenantId" 
        FOREIGN KEY ("tenantId") REFERENCES tenants(id) 
        DEFERRABLE INITIALLY DEFERRED;