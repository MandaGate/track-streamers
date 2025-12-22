-- CreateTable
CREATE TABLE "streamers" (
    "id" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streamers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber_history" (
    "id" VARCHAR(64) NOT NULL,
    "streamer_id" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriber_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriber_history_streamer_id_idx" ON "subscriber_history"("streamer_id");

-- CreateIndex
CREATE INDEX "subscriber_history_timestamp_idx" ON "subscriber_history"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_history_streamer_id_timestamp_key" ON "subscriber_history"("streamer_id", "timestamp");

-- AddForeignKey
ALTER TABLE "subscriber_history" ADD CONSTRAINT "subscriber_history_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "streamers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
