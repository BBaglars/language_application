-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sourceLanguageId" INTEGER NOT NULL,
    "targetLanguageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryWord" (
    "id" SERIAL NOT NULL,
    "storyId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StoryWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "lastReviewed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "gameType" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_jobId_key" ON "Story"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryWord_storyId_wordId_key" ON "StoryWord"("storyId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWordProgress_userId_wordId_key" ON "UserWordProgress"("userId", "wordId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "StoryGenerationJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryWord" ADD CONSTRAINT "StoryWord_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryWord" ADD CONSTRAINT "StoryWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
