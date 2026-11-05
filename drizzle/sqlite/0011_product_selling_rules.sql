ALTER TABLE `products` ADD `selling_rule` text DEFAULT 'standard' NOT NULL CHECK (`selling_rule` IN ('standard', 'variable_weight', 'whole_kg_only'));--> statement-breakpoint
UPDATE `products` SET `selling_rule` = 'variable_weight' WHERE `id` = 4 AND `name` = 'Whole Chicken' AND `tag` = 'Chicken' AND `unit` = 'kg';--> statement-breakpoint
UPDATE `products` SET `selling_rule` = 'whole_kg_only' WHERE `id` = 5 AND `name` = 'Chicken Tikka Chest Cut' AND `tag` = 'Chicken' AND `unit` = 'kg';
