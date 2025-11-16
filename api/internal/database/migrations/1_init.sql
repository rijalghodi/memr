-- +migrate Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "users"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "google_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
ALTER TABLE
    "users" ADD PRIMARY KEY("id");

CREATE TABLE "notes"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "collection_id" UUID,
    "title" VARCHAR(255),
    "content" TEXT,
    "embedding" vector(1536),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
ALTER TABLE
    "notes" ADD PRIMARY KEY("id");

CREATE TABLE "collections"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "color" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
ALTER TABLE
    "collections" ADD PRIMARY KEY("id");


CREATE TABLE "tasks"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "project_id" UUID,
    "title" VARCHAR(255),
    "description" TEXT,
    "status" INTEGER NOT NULL CHECK("status" IN(0, 1, 2, -1)) DEFAULT 0,
    "sort_order" TEXT,
    "due_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
ALTER TABLE
    "tasks" ADD PRIMARY KEY("id");

CREATE TABLE "projects"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "color" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);
ALTER TABLE
    "projects" ADD PRIMARY KEY("id");


CREATE TABLE "collection_note"(
    "collection_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    PRIMARY KEY("collection_id", "note_id")
);

ALTER TABLE
    "projects" ADD CONSTRAINT "projects_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE
    "collection_note" ADD CONSTRAINT "collection_note_collection_id_foreign" FOREIGN KEY("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE;
ALTER TABLE
    "collections" ADD CONSTRAINT "collections_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE
    "tasks" ADD CONSTRAINT "tasks_project_id_foreign" FOREIGN KEY("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
ALTER TABLE
    "collection_note" ADD CONSTRAINT "collection_note_note_id_foreign" FOREIGN KEY("note_id") REFERENCES "notes"("id") ON DELETE CASCADE;

-- +migrate Down
DROP TABLE IF EXISTS "collection_note";
DROP TABLE IF EXISTS "tasks";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "collections";
DROP TABLE IF EXISTS "notes";
DROP TABLE IF EXISTS "users";
DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS "uuid-ossp";