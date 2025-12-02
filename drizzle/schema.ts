import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de pacientes
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: timestamp("birthDate"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Tabela de pedidos de exames
 */
export const examRequests = mysqlTable("examRequests", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull().references(() => patients.id, { onDelete: "cascade" }),
  requestDate: timestamp("requestDate").notNull(),
  doctorName: varchar("doctorName", { length: 255 }),
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 512 }),
  extractedText: text("extractedText"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
});

export type ExamRequest = typeof examRequests.$inferSelect;
export type InsertExamRequest = typeof examRequests.$inferInsert;

/**
 * Tabela de itens individuais do pedido de exames
 */
export const examRequestItems = mysqlTable("examRequestItems", {
  id: int("id").autoincrement().primaryKey(),
  examRequestId: int("examRequestId").notNull().references(() => examRequests.id, { onDelete: "cascade" }),
  examName: varchar("examName", { length: 255 }).notNull(),
  examCode: varchar("examCode", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExamRequestItem = typeof examRequestItems.$inferSelect;
export type InsertExamRequestItem = typeof examRequestItems.$inferInsert;

/**
 * Tabela de resultados de exames
 */
export const examResults = mysqlTable("examResults", {
  id: int("id").autoincrement().primaryKey(),
  examRequestId: int("examRequestId").notNull().references(() => examRequests.id, { onDelete: "cascade" }),
  resultDate: timestamp("resultDate").notNull(),
  laboratoryName: varchar("laboratoryName", { length: 255 }),
  pdfUrl: text("pdfUrl"),
  pdfKey: varchar("pdfKey", { length: 512 }),
  extractedText: text("extractedText"),
  notes: text("notes"),
  complianceStatus: mysqlEnum("complianceStatus", ["pending", "complete", "partial", "not_analyzed"]).default("not_analyzed").notNull(),
  complianceDetails: text("complianceDetails"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
});

export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamResult = typeof examResults.$inferInsert;

/**
 * Tabela de itens individuais do resultado de exames
 */
export const examResultItems = mysqlTable("examResultItems", {
  id: int("id").autoincrement().primaryKey(),
  examResultId: int("examResultId").notNull().references(() => examResults.id, { onDelete: "cascade" }),
  examName: varchar("examName", { length: 255 }).notNull(),
  examCode: varchar("examCode", { length: 100 }),
  value: text("value"),
  unit: varchar("unit", { length: 50 }),
  referenceRange: varchar("referenceRange", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExamResultItem = typeof examResultItems.$inferSelect;
export type InsertExamResultItem = typeof examResultItems.$inferInsert;