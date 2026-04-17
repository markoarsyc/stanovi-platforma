-- CreateTable BuildingImage
CREATE TABLE "BuildingImage" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuildingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuildingImage_buildingId_idx" ON "BuildingImage"("buildingId");

-- CreateIndex
CREATE INDEX "BuildingImage_displayOrder_idx" ON "BuildingImage"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BuildingImage_publicId_key" ON "BuildingImage"("publicId");

-- AddForeignKey
ALTER TABLE "BuildingImage" ADD CONSTRAINT "BuildingImage_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;
