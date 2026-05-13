-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'AUTO_CLOSED');

-- CreateTable
CREATE TABLE "visits" (
    "id" SERIAL NOT NULL,
    "salesman_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkin_latitude" DECIMAL(10,6),
    "checkin_longitude" DECIMAL(10,6),
    "checkout_latitude" DECIMAL(10,6),
    "checkout_longitude" DECIMAL(10,6),
    "checkin_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkout_time" TIMESTAMP(3),
    "visit_duration" INTEGER,
    "order_created" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visits_salesman_id_idx" ON "visits"("salesman_id");

-- CreateIndex
CREATE INDEX "visits_customer_id_idx" ON "visits"("customer_id");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_salesman_id_fkey" FOREIGN KEY ("salesman_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
