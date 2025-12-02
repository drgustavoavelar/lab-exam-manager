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
 * Tabela de análises de exames
 * Modelo simplificado sem necessidade de cadastro de pacientes
 */
export const examAnalyses = mysqlTable("examAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações opcionais do paciente (não obrigatórias)
  patientName: varchar("patientName", { length: 255 }),
  patientIdentifier: varchar("patientIdentifier", { length: 100 }),
  
  // Pedido de exames (texto ou PDF)
  requestText: text("requestText"),
  requestPdfUrl: text("requestPdfUrl"),
  requestPdfKey: varchar("requestPdfKey", { length: 512 }),
  requestDate: timestamp("requestDate"),
  
  // Resultado de exames (PDF ou imagem)
  resultFileUrl: text("resultFileUrl"),
  resultFileKey: varchar("resultFileKey", { length: 512 }),
  resultFileType: varchar("resultFileType", { length: 20 }), // 'pdf' ou 'image'
  resultExtractedText: text("resultExtractedText"),
  resultDate: timestamp("resultDate"),
  
  // Análise de conformidade
  complianceStatus: mysqlEnum("complianceStatus", ["complete", "partial", "pending", "not_analyzed"]).default("not_analyzed").notNull(),
  complianceDetails: text("complianceDetails"), // JSON com detalhes da análise
  requestedExams: text("requestedExams"), // JSON array de exames solicitados
  performedExams: text("performedExams"), // JSON array de exames realizados
  missingExams: text("missingExams"), // JSON array de exames faltantes
  extraExams: text("extraExams"), // JSON array de exames extras
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
});

export type ExamAnalysis = typeof examAnalyses.$inferSelect;
export type InsertExamAnalysis = typeof examAnalyses.$inferInsert;
