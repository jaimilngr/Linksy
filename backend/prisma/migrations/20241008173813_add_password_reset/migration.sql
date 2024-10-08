-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);
