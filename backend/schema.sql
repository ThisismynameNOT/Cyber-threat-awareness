CREATE TABLE `training_counters` (
	`link_id` text PRIMARY KEY NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`education` integer DEFAULT 0 NOT NULL,
	`first_at` text NOT NULL,
	`last_at` text NOT NULL,
	`education_at` text
);
