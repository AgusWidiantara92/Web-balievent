-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ticketQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
