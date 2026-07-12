-- CreateTable
CREATE TABLE "ApartmentModel" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "modelUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApartmentModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentModel_apartmentId_key" ON "ApartmentModel"("apartmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentModel_publicId_key" ON "ApartmentModel"("publicId");

-- CreateIndex
CREATE INDEX "ApartmentModel_apartmentId_idx" ON "ApartmentModel"("apartmentId");

-- AddForeignKey
ALTER TABLE "ApartmentModel" ADD CONSTRAINT "ApartmentModel_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
