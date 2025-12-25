/* ============================================================
   GLOBAL AUDIT TRAIL SETUP (AUTO FOR OLD + FUTURE TABLES)
   ------------------------------------------------------------
   Strategy:
   - beforeSnapshot : full row BEFORE change
   - changeSet      : ONLY changed fields AFTER change
   - INSERT  → changeSet = full row
   - UPDATE  → beforeSnapshot = full row, changeSet = diff
   - DELETE  → beforeSnapshot = full row
   ============================================================ */

/* ============================================================
   0. CLEANUP: Remove any existing audit triggers from migrations table
   ============================================================ */

DO $$
DECLARE
    schema_name TEXT;
    trigger_name TEXT;
BEGIN
    /* Find and drop any audit triggers on migrations table in any schema */
    FOR schema_name IN
        SELECT nspname FROM pg_namespace
        WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    LOOP
        FOR trigger_name IN
            SELECT tgname
            FROM pg_trigger t
            JOIN pg_class c ON c.oid = t.tgrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = schema_name
              AND c.relname = 'migrations'
              AND tgname LIKE '%AuditTrigger%'
        LOOP
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.migrations', trigger_name, schema_name);
        END LOOP;
    END LOOP;
END;
$$;


/* ============================================================
   1. UNIVERSAL AUDIT TRIGGER FUNCTION
   ============================================================ */

CREATE OR REPLACE FUNCTION "auditTriggerFn"()
RETURNS TRIGGER AS $$
DECLARE
    pkColumn   TEXT := TG_ARGV[0];
    vRecordId  TEXT;
    diffSet    JSONB := '{}'::jsonb;
    k          TEXT;
    oldRow     JSONB;
    newRow     JSONB;
BEGIN
    oldRow := to_jsonb(OLD);
    newRow := to_jsonb(NEW);

    EXECUTE format(
        'SELECT ($1).%I',
        pkColumn
    )
    INTO vRecordId
    USING CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;

    /* INSERT */
    IF TG_OP = 'INSERT' THEN
        EXECUTE format(
            'INSERT INTO %I ("recordId", "operation", "changeSet")
             VALUES ($1, $2, $3)',
            'audit_' || TG_TABLE_NAME
        )
        USING vRecordId, TG_OP, newRow;

        RETURN NEW;
    END IF;

    /* UPDATE (diff only) */
    IF TG_OP = 'UPDATE' THEN
        FOR k IN SELECT jsonb_object_keys(newRow)
        LOOP
            IF oldRow -> k IS DISTINCT FROM newRow -> k THEN
                diffSet := diffSet || jsonb_build_object(k, newRow -> k);
            END IF;
        END LOOP;

        IF diffSet = '{}'::jsonb THEN
            RETURN NEW;
        END IF;

        EXECUTE format(
            'INSERT INTO %I ("recordId", "operation", "beforeSnapshot", "changeSet")
             VALUES ($1, $2, $3, $4)',
            'audit_' || TG_TABLE_NAME
        )
        USING vRecordId, TG_OP, oldRow, diffSet;

        RETURN NEW;
    END IF;

    /* DELETE */
    IF TG_OP = 'DELETE' THEN
        EXECUTE format(
            'INSERT INTO %I ("recordId", "operation", "beforeSnapshot")
             VALUES ($1, $2, $3)',
            'audit_' || TG_TABLE_NAME
        )
        USING vRecordId, TG_OP, oldRow;

        RETURN OLD;
    END IF;

END;
$$ LANGUAGE plpgsql;



/* ============================================================
   2. FUNCTION: GET PRIMARY KEY COLUMN NAME FOR A TABLE
   ============================================================ */

CREATE OR REPLACE FUNCTION "getPrimaryKeyColumn"(
    schemaName TEXT,
    tableName  TEXT
)
RETURNS TEXT AS $$
DECLARE
    pkColumn TEXT;
BEGIN
    SELECT a.attname INTO pkColumn
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE i.indisprimary = TRUE
      AND n.nspname = schemaName
      AND c.relname = tableName
    LIMIT 1;

    RETURN pkColumn;
END;
$$ LANGUAGE plpgsql;


/* ============================================================
   3. FUNCTION: CREATE AUDIT TABLE + TRIGGER FOR ONE TABLE
   ============================================================ */

CREATE OR REPLACE FUNCTION "createAuditForTable"(
    schemaName TEXT,
    tableName  TEXT,
    pkColumn   TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    detectedPk TEXT;
BEGIN
    /* Skip audit tables themselves */
    IF tableName LIKE 'audit_%' THEN
        RETURN;
    END IF;

    /* Skip migrations table explicitly */
    IF tableName = 'migrations' THEN
        RETURN;
    END IF;

    /* Detect primary key if not provided */
    IF pkColumn IS NULL THEN
        detectedPk := "getPrimaryKeyColumn"(schemaName, tableName);
        IF detectedPk IS NULL THEN
            /* Skip tables without primary key */
            RETURN;
        END IF;
        pkColumn := detectedPk;
    END IF;

    /* Create audit table */
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I.%I (
            "auditId"         BIGSERIAL PRIMARY KEY,
            "recordId"        TEXT NOT NULL,
            "operation"       TEXT NOT NULL,
            "beforeSnapshot" JSONB,
            "changeSet"      JSONB,
            "changedAt"      TIMESTAMP DEFAULT NOW(),
            "changedBy"      TEXT DEFAULT current_user
        )',
        schemaName,
        'audit_' || tableName
    );

    /* Create trigger if not exists */
    EXECUTE format(
        'DO $do$
         DECLARE
             v_table_oid OID;
         BEGIN
             SELECT c.oid INTO v_table_oid
             FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = %L
               AND c.relname = %L;
             
             IF NOT EXISTS (
                 SELECT 1 FROM pg_trigger
                 WHERE tgname = %L
                   AND tgrelid = v_table_oid
             ) THEN
                 CREATE TRIGGER %I
                 AFTER INSERT OR UPDATE OR DELETE
                 ON %I.%I
                 FOR EACH ROW
                 EXECUTE FUNCTION "auditTriggerFn"(%L);
             END IF;
         END
         $do$;',
        schemaName,
        tableName,
        tableName || 'AuditTrigger',
        tableName || 'AuditTrigger',
        schemaName,
        tableName,
        pkColumn
    );
END;
$$ LANGUAGE plpgsql;



/* ============================================================
   4. APPLY AUDIT TO ALL EXISTING TABLES
   ============================================================ */

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
          AND table_name NOT LIKE 'audit_%'
          AND table_name != 'migrations'
    LOOP
        PERFORM "createAuditForTable"(r.table_schema, r.table_name);
    END LOOP;
END;
$$;



/* ============================================================
   5. EVENT TRIGGER: AUTO-AUDIT FUTURE TABLES
   ============================================================ */

CREATE OR REPLACE FUNCTION "autoAuditOnCreateTable"()
RETURNS EVENT_TRIGGER AS $$
DECLARE
    obj RECORD;
    table_name TEXT;
    function_exists BOOLEAN;
    target_schema TEXT := 'main';  /* Schema-specific: only process tables in this schema */
BEGIN
    FOR obj IN
        SELECT * FROM pg_event_trigger_ddl_commands()
        WHERE command_tag = 'CREATE TABLE'
          AND object_type = 'table'
          AND schema_name = target_schema  /* Only process this schema */
    LOOP
        /* Get table name from pg_class using objid */
        SELECT c.relname INTO table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.oid = obj.objid
          AND n.nspname = obj.schema_name;

        /* Skip if table name not found */
        IF table_name IS NULL THEN
            CONTINUE;
        END IF;

        /* Skip audit tables and migrations table */
        IF table_name LIKE 'audit_%' OR table_name = 'migrations' THEN
            CONTINUE;
        END IF;

        /* Verify that createAuditForTable exists in this schema before calling */
        SELECT EXISTS (
            SELECT 1
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = target_schema
              AND p.proname = 'createAuditForTable'
        ) INTO function_exists;

        /* Only call if function exists in this schema */
        IF function_exists THEN
            PERFORM "createAuditForTable"(
                obj.schema_name,
                table_name
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


/* Drop event trigger if it exists (for idempotency) */
DROP EVENT TRIGGER IF EXISTS "autoAuditCreateTable";

CREATE EVENT TRIGGER "autoAuditCreateTable"
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION "autoAuditOnCreateTable"();
