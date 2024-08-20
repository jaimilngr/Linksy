-- AlterTable
ALTER TABLE "ServiceProvider" ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "Address" DROP NOT NULL;
