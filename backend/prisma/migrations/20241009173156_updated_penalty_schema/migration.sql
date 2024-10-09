/*
  Warnings:

  - You are about to drop the column `suspendedUntil` on the `ServiceProvider` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'expired';

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "suspendedUntil",
ADD COLUMN     "cancelLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCancelExceededAt" TIMESTAMP(3),
ADD COLUMN     "suspendedUntilForCancel" TIMESTAMP(3),
ADD COLUMN     "suspendedUntilForReject" TIMESTAMP(3);
