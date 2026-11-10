/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Existing `User` rows will be populated with the current timestamp for `updatedAt`.

*/
-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'UserRole'
      AND typnamespace = current_schema()::regnamespace
  ) THEN
    CREATE TYPE "UserRole" AS ENUM ('DESIGNER', 'REVIEWER', 'EDITOR');
  END IF;
END;
$$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth0Id" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'REVIEWER',
ADD COLUMN     "updatedAt" TIMESTAMP(3);

UPDATE "User" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "User"("auth0Id");
