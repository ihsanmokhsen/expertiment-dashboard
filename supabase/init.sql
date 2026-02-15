-- Experiment Hub Dashboard schema for Supabase Postgres
-- Run this in Supabase SQL Editor

DO $$ BEGIN
  CREATE TYPE "AppStatus" AS ENUM ('Experiment', 'Beta', 'Production');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AppPlatform" AS ENUM ('v0', 'Base44', 'Lovable', 'Custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "AppStatus" NOT NULL,
  "platform" "AppPlatform" NOT NULL,
  "url" TEXT NOT NULL UNIQUE,
  "iconName" TEXT NOT NULL DEFAULT 'Box',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_project_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_set_updated_at ON "Project";
CREATE TRIGGER project_set_updated_at
BEFORE UPDATE ON "Project"
FOR EACH ROW
EXECUTE PROCEDURE set_project_updated_at();

CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "username" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_set_updated_at ON "AdminUser";
CREATE TRIGGER admin_set_updated_at
BEFORE UPDATE ON "AdminUser"
FOR EACH ROW
EXECUTE PROCEDURE set_admin_updated_at();

INSERT INTO "Project" ("name", "description", "status", "platform", "url", "iconName")
VALUES
  ('Absen Pagi', 'Sistem absensi Apel Pagi BPAD', 'Production', 'v0', 'https://v0-absensi-apel-pagi-bpad.vercel.app/', 'ClipboardCheck'),
  ('Sidak Apel Pagi', 'Monitoring dan sidak kehadiran apel pagi', 'Production', 'Base44', 'https://apel-pagi-ntt.base44.app', 'Eye'),
  ('MagangHub', 'Platform manajemen dan pendampingan peserta magang', 'Beta', 'Lovable', 'https://bpad-magang-buddy.lovable.app', 'GraduationCap')
ON CONFLICT ("url") DO NOTHING;
