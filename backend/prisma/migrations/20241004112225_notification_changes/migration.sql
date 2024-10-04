-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "serviceownedId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_serviceownedId_fkey" FOREIGN KEY ("serviceownedId") REFERENCES "ServiceProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
