-- +migrate Up
CREATE TABLE "chats"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "chats" ADD PRIMARY KEY("id");

CREATE TABLE "messages"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "chat_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL CHECK("role" IN('user','assistant','system','tool')),
    "content" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "messages" ADD PRIMARY KEY("id");

CREATE TABLE "tool_calls"(
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "message_id" UUID NOT NULL,
    "name" TEXT,
    "arguments" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    "tool_calls" ADD PRIMARY KEY("id");

-- Foreign keys
ALTER TABLE
    "chats" ADD CONSTRAINT "chats_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_chat_id_foreign" FOREIGN KEY("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE;
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE
    "tool_calls" ADD CONSTRAINT "tool_calls_message_id_foreign" FOREIGN KEY("message_id") REFERENCES "messages"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX "idx_messages_chat_id_created_at" ON "messages"("chat_id", "created_at");

-- +migrate Down
DROP INDEX IF EXISTS "idx_messages_chat_id_created_at";
DROP TABLE IF EXISTS "tool_calls";
DROP TABLE IF EXISTS "messages";
DROP TABLE IF EXISTS "chats";

