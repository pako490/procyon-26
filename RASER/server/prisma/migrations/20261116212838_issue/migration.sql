-- CreateTable
CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "assignedEditorId" INTEGER,
    "volumeNumber" INTEGER NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "journalId" INTEGER NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
