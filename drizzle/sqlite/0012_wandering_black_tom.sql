CREATE TABLE `tags` (
	`name` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `tags` (`name`, `position`) VALUES ('Vegetables', 1), ('Eggs', 2), ('Bakery', 3), ('Pantry', 4), ('Chicken', 5);--> statement-breakpoint
INSERT OR IGNORE INTO `tags` (`name`, `position`) SELECT DISTINCT `tag`, 6 FROM `products`;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`ai_keywords` text DEFAULT '' NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`description` text NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`image_url` text NOT NULL,
	`name` text NOT NULL,
	`price_rs` integer NOT NULL,
	`selling_rule` text DEFAULT 'standard' NOT NULL CHECK (`selling_rule` IN ('standard', 'variable_weight', 'whole_kg_only')),
	`tag` text NOT NULL,
	`unit` text NOT NULL,
	FOREIGN KEY (`tag`) REFERENCES `tags`(`name`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_products`("ai_keywords", "available", "description", "id", "image_url", "name", "price_rs", "selling_rule", "tag", "unit") SELECT "ai_keywords", "available", "description", "id", "image_url", "name", "price_rs", "selling_rule", "tag", "unit" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, tag, ai_keywords, description)
  VALUES (new.id, new.name, new.tag, new.ai_keywords, new.description);
END;--> statement-breakpoint
CREATE TRIGGER products_ad AFTER DELETE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, name, tag, ai_keywords, description)
  VALUES ('delete', old.id, old.name, old.tag, old.ai_keywords, old.description);
END;--> statement-breakpoint
CREATE TRIGGER products_au AFTER UPDATE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, name, tag, ai_keywords, description)
  VALUES ('delete', old.id, old.name, old.tag, old.ai_keywords, old.description);
  INSERT INTO products_fts(rowid, name, tag, ai_keywords, description)
  VALUES (new.id, new.name, new.tag, new.ai_keywords, new.description);
END;--> statement-breakpoint
INSERT INTO products_fts(products_fts) VALUES ('rebuild');
