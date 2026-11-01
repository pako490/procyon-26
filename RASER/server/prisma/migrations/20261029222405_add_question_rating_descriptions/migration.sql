-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "rating1Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating2Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating3Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating4Description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rating5Description" TEXT NOT NULL DEFAULT '';
