CREATE TABLE `examRequestItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examRequestId` int NOT NULL,
	`examName` varchar(255) NOT NULL,
	`examCode` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `examRequestItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`requestDate` timestamp NOT NULL,
	`doctorName` varchar(255),
	`pdfUrl` text,
	`pdfKey` varchar(512),
	`extractedText` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `examRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examResultItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examResultId` int NOT NULL,
	`examName` varchar(255) NOT NULL,
	`examCode` varchar(100),
	`value` text,
	`unit` varchar(50),
	`referenceRange` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `examResultItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examRequestId` int NOT NULL,
	`resultDate` timestamp NOT NULL,
	`laboratoryName` varchar(255),
	`pdfUrl` text,
	`pdfKey` varchar(512),
	`extractedText` text,
	`notes` text,
	`complianceStatus` enum('pending','complete','partial','not_analyzed') NOT NULL DEFAULT 'not_analyzed',
	`complianceDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `examResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`birthDate` timestamp,
	`phone` varchar(20),
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `examRequestItems` ADD CONSTRAINT `examRequestItems_examRequestId_examRequests_id_fk` FOREIGN KEY (`examRequestId`) REFERENCES `examRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `examRequests` ADD CONSTRAINT `examRequests_patientId_patients_id_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `examRequests` ADD CONSTRAINT `examRequests_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `examResultItems` ADD CONSTRAINT `examResultItems_examResultId_examResults_id_fk` FOREIGN KEY (`examResultId`) REFERENCES `examResults`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `examResults` ADD CONSTRAINT `examResults_examRequestId_examRequests_id_fk` FOREIGN KEY (`examRequestId`) REFERENCES `examRequests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `examResults` ADD CONSTRAINT `examResults_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;