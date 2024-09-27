/*
  Warnings:

  - You are about to drop the column `providerId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `ServiceProvider` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_providerId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "providerId",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "ServiceProvider" DROP COLUMN "rating",
ALTER COLUMN "mode" SET DEFAULT 'offline';

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
