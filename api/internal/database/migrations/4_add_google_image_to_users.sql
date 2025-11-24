-- +migrate Up
ALTER TABLE "users" ADD COLUMN "google_image" TEXT;
ALTER TABLE "users" DROP COLUMN "google_id";

-- +migrate Down
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
ALTER TABLE "users" DROP COLUMN "google_image";

