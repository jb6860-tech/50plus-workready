CREATE TABLE `resume_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`data` text NOT NULL,
	`template` varchar(32) NOT NULL DEFAULT 'classic',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resume_drafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `resume_drafts_userId_unique` UNIQUE(`userId`)
);
