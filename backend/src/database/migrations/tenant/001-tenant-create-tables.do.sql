-- ==================== TENANT-SPECIFIC LOOKUP TABLES ====================
-- tenant_lookup_types Table (tenant-specific lookup types)
CREATE TABLE IF NOT EXISTS tenant_lookup_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    -- Internal name (e.g., 'DESIGNATION', 'DEPARTMENT')
    label VARCHAR(255) NOT NULL,
    -- Display label (e.g., 'Designation', 'Department')
    "isSystem" BOOLEAN NOT NULL,
    -- System values that cannot be deleted

    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),

    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id)
);
-- tenant_lookups Table (tenant-specific lookup values)
CREATE TABLE IF NOT EXISTS tenant_lookups (
    id SERIAL PRIMARY KEY,
    "lookupTypeId" INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    -- Internal name (e.g., 'DESIGNATION_DEVELOPER', 'DEPARTMENT_HR')
    label VARCHAR(255) NOT NULL,
    -- Display label (e.g., 'Senior Developer', 'Human Resources')
    category VARCHAR(100) DEFAULT NULL,
    -- Category of the lookup value (e.g., 'PLATFORM', 'TENANT')
    description TEXT,
    -- Optional description
    "isSystem" BOOLEAN DEFAULT FALSE NOT NULL,
    "sortOrder" INT DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),

    CONSTRAINT fk_tenant_lookups_tenant_lookup_types FOREIGN KEY ("lookupTypeId") REFERENCES tenant_lookup_types (id),
    CONSTRAINT unique_tenant_lookup_type_id_name UNIQUE ("lookupTypeId", name),
    CONSTRAINT unique_tenant_lookup_type_id_label UNIQUE ("lookupTypeId", label)
);

/* ============================================================
   TENANT SPECIFIC ROLES TABLE
   ============================================================ */
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

    "sortOrder" INT NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT REFERENCES main.users(id),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT REFERENCES main.users(id),

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT REFERENCES main.users(id)
);

/* ============================================================
   TENANT SPECIFIC PERMISSIONS TABLE
   ============================================================ */
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,

    "sortOrder" INT NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,

    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdBy" INT REFERENCES main.users(id),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedBy" INT REFERENCES main.users(id),

    "isArchived" BOOLEAN NOT NULL DEFAULT FALSE,
    "archivedAt" TIMESTAMPTZ,
    "archivedBy" INT REFERENCES main.users(id)
);

/* ============================================================
   ROLE PERMISSIONS XREF
   ============================================================ */
CREATE TABLE role_permissions_xref (
    id SERIAL PRIMARY KEY,

    "roleId" INT NOT NULL REFERENCES roles(id),
    "permissionId" INT NOT NULL REFERENCES permissions(id),

    "createdAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),

    "updatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),

    UNIQUE ("roleId", "permissionId")
);

-- ==================== USER MANAGEMENT TABLES ====================
-- user_contacts Table (stores different contact types per tenant)
CREATE TABLE IF NOT EXISTS user_contacts (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    -- Foreign key to main.users table
    "contactTypeId" INT NOT NULL,
    -- Foreign key to main.lookups (CONTACT_TYPE)
    value VARCHAR(255) NOT NULL,
    -- The actual contact value (email or phone)
    "isPrimary" BOOLEAN DEFAULT FALSE NOT NULL,
    -- Is this the primary contact of this type
    "isVerified" BOOLEAN DEFAULT FALSE NOT NULL,
    -- Is this contact verified
    
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),

    CONSTRAINT fk_user_contacts_user FOREIGN KEY ("userId") REFERENCES main.users(id),
    CONSTRAINT fk_user_contacts_contact_type FOREIGN KEY ("contactTypeId") REFERENCES tenant_lookups (id),
    CONSTRAINT unique_user_contact_type_value UNIQUE ("userId", "contactTypeId", value) -- Same user can't have duplicate contacts
);
-- user_job_details Table (stores job-related information per tenant)
CREATE TABLE IF NOT EXISTS user_job_details (
    id SERIAL PRIMARY KEY,
    "userId" INT NOT NULL UNIQUE,
    -- Foreign key to main.users table
    "hiringDate" DATE,
    "joiningDate" DATE,
    "probationPeriodMonths" INT,
    "designationId" INT,
    -- Foreign key to tenant_lookups (DESIGNATION)
    "departmentId" INT,
    -- Foreign key to tenant_lookups (DEPARTMENT)
    "designation" VARCHAR(255),
    -- Legacy field for backward compatibility (can be removed later)
    "department" VARCHAR(255),
    -- Legacy field for backward compatibility (can be removed later)
    "ctc" DECIMAL(15, 2),
    "reportingManagerId" INT DEFAULT NULL REFERENCES main.users(id),

    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL REFERENCES main.users(id),

    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedBy" INT DEFAULT NULL REFERENCES main.users(id),
    
    "isArchived" BOOLEAN DEFAULT FALSE NOT NULL,
    "archivedAt" TIMESTAMP DEFAULT NULL,
    "archivedBy" INT DEFAULT NULL REFERENCES main.users(id),

    CONSTRAINT fk_user_job_details_user FOREIGN KEY ("userId") REFERENCES main.users(id),
    CONSTRAINT fk_user_job_details_designation FOREIGN KEY ("designationId") REFERENCES tenant_lookups (id),
    CONSTRAINT fk_user_job_details_department FOREIGN KEY ("departmentId") REFERENCES tenant_lookups (id),
    CONSTRAINT fk_user_job_details_manager FOREIGN KEY ("reportingManagerId") REFERENCES main.users(id),
    CONSTRAINT unique_user_job_details UNIQUE ("userId") -- One job detail record per user
);