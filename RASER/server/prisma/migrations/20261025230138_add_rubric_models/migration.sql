-- CreateTable
CREATE TABLE "Rubric" (
    "id" SERIAL NOT NULL,
    "assignedDesignerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "publishDate" TIMESTAMP(3),
    "deprecationDate" TIMESTAMP(3),
    "replacementRubricId" INTEGER,
    "maxScoreComputed" INTEGER NOT NULL,
    "lowQualThreshold" INTEGER NOT NULL,
    "highQualThreshold" INTEGER NOT NULL,
    "sampleURL" TEXT NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "assignedRubricId" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "assignedSectionId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricDesigner" (
    "designerId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "RubricDesigner_pkey" PRIMARY KEY ("designerId")
);

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_assignedRubricId_fkey" FOREIGN KEY ("assignedRubricId") REFERENCES "Rubric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assignedSectionId_fkey" FOREIGN KEY ("assignedSectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
