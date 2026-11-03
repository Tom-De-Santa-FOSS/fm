CREATE TABLE `products` (
	`ai_keywords` text DEFAULT '' NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`description` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`image_url` text NOT NULL,
	`name` text NOT NULL,
	`price_rs` integer NOT NULL,
	`tag` text NOT NULL,
	`unit` text NOT NULL
);
