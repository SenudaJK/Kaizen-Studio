-- CreateEnum
CREATE TYPE "FlowRoutineType" AS ENUM ('MORNING', 'EVENING');

-- CreateEnum
CREATE TYPE "HabitStatus" AS ENUM ('DONE', 'SLIP', 'PENDING');

-- CreateEnum
CREATE TYPE "FishboneCategory" AS ENUM ('ENVIRONMENT', 'ENERGY', 'ROUTINE', 'MINDSET');

-- CreateEnum
CREATE TYPE "SpecDirection" AS ENUM ('MIN', 'MAX');

-- CreateEnum
CREATE TYPE "ArrowPathType" AS ENUM ('CRITICAL_PATH', 'PARALLEL_SLACK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowRoutine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FlowRoutineType" NOT NULL,

    CONSTRAINT "FlowRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowStep" (
    "id" TEXT NOT NULL,
    "flowRoutineId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "stepType" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "HabitStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrictionTrigger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkedBone" TEXT,

    CONSTRAINT "FrictionTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrictionTally" (
    "id" TEXT NOT NULL,
    "frictionTriggerId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "FrictionTally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishboneProblem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "FishboneProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishboneCause" (
    "id" TEXT NOT NULL,
    "fishboneProblemId" TEXT NOT NULL,
    "category" "FishboneCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FishboneCause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpcMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "specLimit" DOUBLE PRECISION NOT NULL,
    "specDirection" "SpecDirection" NOT NULL,

    CONSTRAINT "SpcMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpcDataPoint" (
    "id" TEXT NOT NULL,
    "spcMetricId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "note" TEXT,

    CONSTRAINT "SpcDataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdpcPillar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PdpcPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdpcScenario" (
    "id" TEXT NOT NULL,
    "pdpcPillarId" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "counter" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PdpcScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrowNode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "path" "ArrowPathType" NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArrowNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FlowRoutine_userId_type_key" ON "FlowRoutine"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FishboneProblem_userId_key_key" ON "FishboneProblem"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "SpcMetric_userId_key_key" ON "SpcMetric"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "SpcDataPoint_spcMetricId_date_key" ON "SpcDataPoint"("spcMetricId", "date");

-- AddForeignKey
ALTER TABLE "FlowRoutine" ADD CONSTRAINT "FlowRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowStep" ADD CONSTRAINT "FlowStep_flowRoutineId_fkey" FOREIGN KEY ("flowRoutineId") REFERENCES "FlowRoutine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrictionTrigger" ADD CONSTRAINT "FrictionTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrictionTally" ADD CONSTRAINT "FrictionTally_frictionTriggerId_fkey" FOREIGN KEY ("frictionTriggerId") REFERENCES "FrictionTrigger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishboneProblem" ADD CONSTRAINT "FishboneProblem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishboneCause" ADD CONSTRAINT "FishboneCause_fishboneProblemId_fkey" FOREIGN KEY ("fishboneProblemId") REFERENCES "FishboneProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpcMetric" ADD CONSTRAINT "SpcMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpcDataPoint" ADD CONSTRAINT "SpcDataPoint_spcMetricId_fkey" FOREIGN KEY ("spcMetricId") REFERENCES "SpcMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdpcPillar" ADD CONSTRAINT "PdpcPillar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdpcScenario" ADD CONSTRAINT "PdpcScenario_pdpcPillarId_fkey" FOREIGN KEY ("pdpcPillarId") REFERENCES "PdpcPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrowNode" ADD CONSTRAINT "ArrowNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
