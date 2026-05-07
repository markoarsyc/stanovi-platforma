-- CreateTable
CREATE TABLE "Event" (
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventId")
);
