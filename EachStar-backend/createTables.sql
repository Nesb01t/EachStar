
CREATE TABLE "users" (
"id" BIGINT PRIMARY KEY NOT NULL,
"type" TEXT NOT NULL,
"name" TEXT NOT NULL,
"avatar" TEXT NOT NULL,
"price" BIGINT NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "cards" (
"id" BIGINT PRIMARY KEY NOT NULL,
"type" TEXT NOT NULL,
"user_id" BIGINT NOT NULL,
"title" TEXT NOT NULL,
"context" TEXT NOT NULL,
"star_price" BIGINT NOT NULL,
"star_num" BIGINT NOT NULL,
"expire_time" TIMESTAMP(3) NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "user_star" (
"id" BIGINT PRIMARY KEY NOT NULL,
"type" TEXT NOT NULL,
"user_id" BIGINT NOT NULL,
"card_id" BIGINT NOT NULL, 
"author_id" BIGINT NOT NULL,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);