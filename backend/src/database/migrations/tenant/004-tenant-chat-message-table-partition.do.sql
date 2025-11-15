-- ===========================================================
-- Function to create a partition for the provided month start
-- ===========================================================
CREATE OR REPLACE FUNCTION create_chat_message_partition(month_start TIMESTAMPTZ)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    normalized_start TIMESTAMP := date_trunc('month', month_start);
    next_month_start TIMESTAMP := normalized_start + INTERVAL '1 month';
    partition_name TEXT := format('chat_message_%s', to_char(normalized_start, 'YYYY_MM'));
BEGIN
    IF normalized_start IS NULL THEN
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE tablename = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF chat_message
                 FOR VALUES FROM (%L) TO (%L);',
            partition_name,
            normalized_start,
            next_month_start
        );

        RAISE NOTICE 'Auto-created chat_message partition: %', partition_name;
    END IF;
END;
$$;
-- ===========================================================
-- Function to ensure partitions exist for current/next month (or supplied date)
-- ===========================================================
CREATE OR REPLACE FUNCTION prepare_chat_message_partitions(target_date TIMESTAMPTZ DEFAULT NOW())
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    month_start TIMESTAMP := date_trunc('month', target_date);
BEGIN
    PERFORM create_chat_message_partition(month_start);
    PERFORM create_chat_message_partition(month_start + INTERVAL '1 month');
END;
$$;
-- ===========================================================
-- Seed partitions for current and next month at migration time
-- ===========================================================
SELECT prepare_chat_message_partitions(NOW());
-- ===========================================================
-- Attempt to schedule daily and reboot-time checks using pg_cron when available
-- ===========================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_available_extensions
        WHERE name = 'pg_cron'
    ) THEN
        BEGIN
            CREATE EXTENSION IF NOT EXISTS pg_cron;
        EXCEPTION
            WHEN duplicate_object THEN
                NULL;
        END;

        -- Remove previous jobs with the same names if they exist
        IF EXISTS (
            SELECT 1
            FROM cron.job
            WHERE jobname = 'chat_message_partitions_daily'
        ) THEN
            PERFORM cron.unschedule(jobid)
            FROM cron.job
            WHERE jobname = 'chat_message_partitions_daily';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM cron.job
            WHERE jobname = 'chat_message_partitions_on_boot'
        ) THEN
            PERFORM cron.unschedule(jobid)
            FROM cron.job
            WHERE jobname = 'chat_message_partitions_on_boot';
        END IF;

        -- Schedule daily run at midnight
        PERFORM cron.schedule(
            'chat_message_partitions_daily',
            '0 0 * * *',
            'SELECT prepare_chat_message_partitions(now());'
        );

        -- Schedule run at server restart
        PERFORM cron.schedule(
            'chat_message_partitions_on_boot',
            '@reboot',
            'SELECT prepare_chat_message_partitions(now());'
        );
    ELSE
        RAISE NOTICE 'pg_cron not available; schedule prepare_chat_message_partitions manually.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Unable to schedule chat_message partition maintenance: %', SQLERRM;
END;
$$;