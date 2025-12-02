CREATE TABLE `examAnalyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientName` varchar(255),
	`patientIdentifier` varchar(100),
	`requestText` text,
	`requestPdfUrl` text,
	`requestPdfKey` varchar(512),
	`requestDate` timestamp,
	`resultFileUrl` text,
	`resultFileKey` varchar(512),
	`resultFileType` varchar(20),
	`resultExtractedText` text,
	`resultDate` timestamp,
	`complianceStatus` enum('complete','partial','pending','not_analyzed') NOT NULL DEFAULT 'not_analyzed',
	`complianceDetails` text,
	`requestedExams` text,
	`performedExams` text,
	`missingExams` text,
	`extraExams` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `examAnalyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `examRequestItems`;--> statement-breakpoint
DROP TABLE `examRequests`;--> statement-breakpoint
DROP TABLE `examResultItems`;--> statement-breakpoint
DROP TABLE `examResults`;--> statement-breakpoint
DROP TABLE `patients`;--> statement-breakpoint
ALTER TABLE `examAnalyses` ADD CONSTRAINT `examAnalyses_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;