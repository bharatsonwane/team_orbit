-- lookup_type Table
CREATE TABLE IF NOT EXISTS lookup_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- lookup Table
CREATE TABLE IF NOT EXISTS lookup (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    "lookupTypeId" INT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_lookup_lookup_type FOREIGN KEY ("lookupTypeId") REFERENCES lookup_type (id),
    CONSTRAINT unique_lookup_type_id_label UNIQUE ("lookupTypeId", label)
);

-- tenant Table
CREATE TABLE IF NOT EXISTS tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    CONSTRAINT unique_tenant_name UNIQUE (name),
    CONSTRAINT unique_tenant_label UNIQUE (label)
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

-- user_status_enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM ('Pending', 'Active', 'Archived', 'Suspended');
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
    password VARCHAR(255),  -- Store hashed password
    bio TEXT, -- User biography
    "userStatus" user_status_enum, -- Use ENUM type
    "tenantId" INT,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_user_tenant FOREIGN KEY ("tenantId") REFERENCES tenant (id)
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