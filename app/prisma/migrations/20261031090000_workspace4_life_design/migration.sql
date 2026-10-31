-- ArrowNode.duration was free text ("4 Days"); the critical path needs a number.
ALTER TABLE "ArrowNode" DROP COLUMN "duration",
ADD COLUMN     "durationDays" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "ArrowNode" ALTER COLUMN "durationDays" DROP DEFAULT;

-- CreateTable
CREATE TABLE "LifeGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pdpcObjective" TEXT,
    "arrowGoal" TEXT,

    CONSTRAINT "LifeGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifeGoal_userId_key" ON "LifeGoal"("userId");

-- AddForeignKey
ALTER TABLE "LifeGoal" ADD CONSTRAINT "LifeGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
