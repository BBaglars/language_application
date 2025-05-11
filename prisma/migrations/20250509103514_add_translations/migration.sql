-- CreateTable
CREATE TABLE "LanguagePair" (
    "id" SERIAL NOT NULL,
    "sourceLanguageId" INTEGER NOT NULL,
    "targetLanguageId" INTEGER NOT NULL,

    CONSTRAINT "LanguagePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "languagePairId" INTEGER NOT NULL,
    "sourceWordId" INTEGER NOT NULL,
    "targetWordId" INTEGER NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LanguagePair_sourceLanguageId_targetLanguageId_key" ON "LanguagePair"("sourceLanguageId", "targetLanguageId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_languagePairId_sourceWordId_targetWordId_key" ON "Translation"("languagePairId", "sourceWordId", "targetWordId");

-- AddForeignKey
ALTER TABLE "LanguagePair" ADD CONSTRAINT "LanguagePair_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguagePair" ADD CONSTRAINT "LanguagePair_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_languagePairId_fkey" FOREIGN KEY ("languagePairId") REFERENCES "LanguagePair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_sourceWordId_fkey" FOREIGN KEY ("sourceWordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_targetWordId_fkey" FOREIGN KEY ("targetWordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
