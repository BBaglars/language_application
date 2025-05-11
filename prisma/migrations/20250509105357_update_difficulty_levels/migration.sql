/*
  Warnings:

  - You are about to alter the column `difficultyLevel` on the `Word` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(2)`.

*/
-- AlterTable
ALTER TABLE "Word" ALTER COLUMN "difficultyLevel" SET DATA TYPE VARCHAR(2);
