/*
  Warnings:

  - A unique constraint covering the columns `[ticketId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notificationId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceownedId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_providerId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "ticketId" INTEGER;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notificationId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "serviceownedId" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "providerId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_ticketId_key" ON "Notification"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_notificationId_key" ON "Ticket"("notificationId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_serviceownedId_fkey" FOREIGN KEY ("serviceownedId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
