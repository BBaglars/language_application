-- CreateTable
CREATE TABLE "StoryGenerationCriteria" (
    "id" SERIAL NOT NULL,
    "languagePairId" INTEGER NOT NULL,
    "minWordCount" INTEGER NOT NULL,
    "maxWordCount" INTEGER NOT NULL,
    "difficultyLevel" VARCHAR(20),
    "categoryIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryGenerationCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryGenerationJob" (
    "id" SERIAL NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StoryGenerationJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoryGenerationCriteria" ADD CONSTRAINT "StoryGenerationCriteria_languagePairId_fkey" FOREIGN KEY ("languagePairId") REFERENCES "LanguagePair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryGenerationJob" ADD CONSTRAINT "StoryGenerationJob_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "StoryGenerationCriteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
