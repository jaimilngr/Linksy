/*
  Warnings:

  - Made the column `location` on table `ServiceProvider` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `Address` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Address" TEXT NOT NULL,
ALTER COLUMN "location" SET NOT NULL;
