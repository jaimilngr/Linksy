-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "lastRejectExceededAt" TIMESTAMP(3),
ADD COLUMN     "rejectLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suspendedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cancelLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCancelExceededAt" TIMESTAMP(3),
ADD COLUMN     "suspendedUntil" TIMESTAMP(3);
