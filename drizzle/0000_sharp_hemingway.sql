CREATE EXTENSION IF NOT EXISTS pg_search CASCADE;
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"tag" text NOT NULL,
	"image_url" text NOT NULL,
	"price_rs" integer NOT NULL,
	"unit" text NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"ai_keywords" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "products_search_idx" ON "products" USING paradedb ("id", "name", "description", "tag", "ai_keywords");
