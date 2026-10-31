/*
  Warnings:

  - You are about to drop the column `done` on the `FlowStep` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `FlowStep` table. All the data in the column will be lost.
  - You are about to drop the column `stepType` on the `FlowStep` table. All the data in the column will be lost.
  - Added the required column `durationMin` to the `FlowStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `FlowStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loggedOn` to the `FrictionTally` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FlowStepKind" AS ENUM ('INPUT', 'PROCESS', 'GATE', 'OUTPUT', 'CORE_CTQ', 'AUDIT', 'POKA_YOKE', 'WIND_DOWN');

-- AlterTable
ALTER TABLE "FlowStep" DROP COLUMN "done",
DROP COLUMN "duration",
DROP COLUMN "stepType",
ADD COLUMN     "durationMin" INTEGER NOT NULL,
ADD COLUMN     "kind" "FlowStepKind" NOT NULL;

-- AlterTable
ALTER TABLE "FrictionTally" ADD COLUMN     "loggedOn" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "FlowStepLog" (
    "id" TEXT NOT NULL,
    "flowStepId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlowStepLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlowStepLog_flowStepId_date_key" ON "FlowStepLog"("flowStepId", "date");

-- CreateIndex
CREATE INDEX "FlowStep_flowRoutineId_order_idx" ON "FlowStep"("flowRoutineId", "order");

-- CreateIndex
CREATE INDEX "FrictionTally_frictionTriggerId_loggedOn_idx" ON "FrictionTally"("frictionTriggerId", "loggedOn");

-- AddForeignKey
ALTER TABLE "FlowStepLog" ADD CONSTRAINT "FlowStepLog_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "FlowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
