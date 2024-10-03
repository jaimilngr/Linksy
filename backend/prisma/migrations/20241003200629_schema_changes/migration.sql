/*
  Warnings:

  - The values [closed] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `ticketId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('open', 'cancel', 'rejected', 'done');
ALTER TABLE "Ticket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "TicketStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "ticketId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "cancellationReason" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
