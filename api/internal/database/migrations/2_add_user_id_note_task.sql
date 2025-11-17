-- +migrate Up
ALTER TABLE "notes" ADD COLUMN "user_id" UUID NOT NULL;
ALTER TABLE "tasks" ADD COLUMN "user_id" UUID NOT NULL;

ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- +migrate Down
ALTER TABLE "notes" DROP CONSTRAINT "notes_user_id_foreign";
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_id_foreign";

ALTER TABLE "notes" DROP COLUMN "user_id";
ALTER TABLE "tasks" DROP COLUMN "user_id";
