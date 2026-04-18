-- CreateTable
CREATE TABLE "ApartmentImage" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApartmentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentImage_publicId_key" ON "ApartmentImage"("publicId");

-- CreateIndex
CREATE INDEX "ApartmentImage_apartmentId_idx" ON "ApartmentImage"("apartmentId");

-- CreateIndex
CREATE INDEX "ApartmentImage_displayOrder_idx" ON "ApartmentImage"("displayOrder");

-- AddForeignKey
ALTER TABLE "ApartmentImage" ADD CONSTRAINT "ApartmentImage_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
