-- AlterTable
ALTER TABLE "Rubric"
    ALTER COLUMN "assignedDesignerId" DROP NOT NULL,
    ALTER COLUMN "lowQualThreshold" DROP NOT NULL,
    ALTER COLUMN "highQualThreshold" DROP NOT NULL;
