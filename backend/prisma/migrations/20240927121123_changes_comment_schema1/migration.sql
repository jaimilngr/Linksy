/*
  Warnings:

  - You are about to drop the column `commenterType` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commenterType";

-- DropEnum
DROP TYPE "CommenterType";
