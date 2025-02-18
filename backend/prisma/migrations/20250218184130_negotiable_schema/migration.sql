-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "negotiability" TEXT NOT NULL DEFAULT 'no';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "negotiatedPrice" DOUBLE PRECISION,
ADD COLUMN     "originalPrice" DOUBLE PRECISION;
