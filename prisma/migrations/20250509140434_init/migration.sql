/*
  Warnings:

  - You are about to drop the column `createdAt` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `nativeName` on the `Language` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `sourceLanguageId` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `targetLanguageId` on the `Story` table. All the data in the column will be lost.
  - You are about to drop the column `categoryIds` on the `StoryGenerationCriteria` table. All the data in the column will be lost.
  - You are about to drop the column `difficultyLevel` on the `StoryGenerationCriteria` table. All the data in the column will be lost.
  - You are about to drop the column `languagePairId` on the `StoryGenerationCriteria` table. All the data in the column will be lost.
  - You are about to drop the column `maxWordCount` on the `StoryGenerationCriteria` table. All the data in the column will be lost.
  - You are about to drop the column `minWordCount` on the `StoryGenerationCriteria` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `StoryGenerationJob` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `StoryGenerationJob` table. All the data in the column will be lost.
  - You are about to drop the column `sourceWordId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `targetWordId` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `firebaseUid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastReviewed` on the `UserWordProgress` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `UserWordProgress` table. All the data in the column will be lost.
  - You are about to drop the column `letterCount` on the `Word` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebaseId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswers` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSpent` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrongAnswers` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gameType` on the `GameResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LanguagePair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficultyLevel` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Story` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StoryGenerationCriteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parameters` to the `StoryGenerationCriteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StoryGenerationCriteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StoryGenerationCriteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storyId` to the `StoryGenerationJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StoryGenerationJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StoryGenerationJob` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `StoryGenerationJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sourceText` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetText` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firebaseId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lastReviewedAt` to the `UserWordProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proficiencyLevel` to the `UserWordProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewCount` to the `UserWordProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meaning` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficultyLevel` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('WORD_MATCH', 'TRANSLATION', 'STORY_COMPLETION');

-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_sourceLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_targetLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "StoryGenerationCriteria" DROP CONSTRAINT "StoryGenerationCriteria_languagePairId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_sourceWordId_fkey";

-- DropForeignKey
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_targetWordId_fkey";

-- DropIndex
DROP INDEX "LanguagePair_sourceLanguageId_targetLanguageId_key";

-- DropIndex
DROP INDEX "Story_jobId_key";

-- DropIndex
DROP INDEX "Translation_languagePairId_sourceWordId_targetWordId_key";

-- DropIndex
DROP INDEX "User_firebaseUid_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "GameResult" DROP COLUMN "createdAt",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "difficultyLevel" "DifficultyLevel",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD COLUMN     "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timeSpent" INTEGER NOT NULL,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL,
DROP COLUMN "gameType",
ADD COLUMN     "gameType" "GameType" NOT NULL;

-- AlterTable
ALTER TABLE "Language" DROP COLUMN "nativeName",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LanguagePair" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Story" DROP COLUMN "jobId",
DROP COLUMN "sourceLanguageId",
DROP COLUMN "targetLanguageId",
ADD COLUMN     "difficultyLevel" "DifficultyLevel" NOT NULL,
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StoryGenerationCriteria" DROP COLUMN "categoryIds",
DROP COLUMN "difficultyLevel",
DROP COLUMN "languagePairId",
DROP COLUMN "maxWordCount",
DROP COLUMN "minWordCount",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parameters" JSONB NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StoryGenerationJob" DROP COLUMN "completedAt",
DROP COLUMN "error",
ADD COLUMN     "storyId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "GenerationJobStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "sourceWordId",
DROP COLUMN "targetWordId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sourceText" TEXT NOT NULL,
ADD COLUMN     "targetText" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firebaseUid",
ADD COLUMN     "firebaseId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserWordProgress" DROP COLUMN "lastReviewed",
DROP COLUMN "level",
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "proficiencyLevel" "ProficiencyLevel" NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "letterCount",
ADD COLUMN     "example" TEXT,
ADD COLUMN     "meaning" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "difficultyLevel",
ADD COLUMN     "difficultyLevel" "DifficultyLevel" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseId_key" ON "User"("firebaseId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryGenerationJob" ADD CONSTRAINT "StoryGenerationJob_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryGenerationJob" ADD CONSTRAINT "StoryGenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryGenerationCriteria" ADD CONSTRAINT "StoryGenerationCriteria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
