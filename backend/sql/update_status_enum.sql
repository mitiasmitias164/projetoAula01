-- Migration to add 'CONCLUIDA' to the turma_status enum

-- Verify if the type exists before altering (Best practice: idempotency)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'turma_status') THEN
        -- If it doesn't exist (e.g. fresh install), create it
        CREATE TYPE turma_status AS ENUM ('ABERTA', 'ENCERRADA', 'CONCLUIDA');
    ELSE
        -- If it exists, try to add the value if not already present
        ALTER TYPE turma_status ADD VALUE IF NOT EXISTS 'CONCLUIDA';
    END IF;
END$$;
