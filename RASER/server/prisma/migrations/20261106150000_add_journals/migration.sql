CREATE TABLE "JournalEditor" (
    "editorId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "JournalEditor_pkey" PRIMARY KEY ("editorId")
);

CREATE TABLE "Journal" (
    "id" SERIAL NOT NULL,
    "assignedEditorId" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);
