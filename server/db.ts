import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

import { patients, examRequests, examResults, examRequestItems, examResultItems, InsertPatient, InsertExamRequest, InsertExamResult, InsertExamRequestItem, InsertExamResultItem } from "../drizzle/schema";
import { desc, and } from "drizzle-orm";

// ===== Pacientes =====
export async function createPatient(patient: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patients).values(patient);
  return result[0].insertId;
}

export async function getPatientsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(patients).where(eq(patients.createdBy, userId)).orderBy(desc(patients.createdAt));
}

export async function getPatientById(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  return result[0];
}

export async function updatePatient(patientId: number, data: Partial<InsertPatient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(patients).set(data).where(eq(patients.id, patientId));
}

// ===== Pedidos de Exames =====
export async function createExamRequest(request: InsertExamRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(examRequests).values(request);
  return result[0].insertId;
}

export async function getExamRequestsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examRequests).where(eq(examRequests.patientId, patientId)).orderBy(desc(examRequests.requestDate));
}

export async function getExamRequestById(requestId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(examRequests).where(eq(examRequests.id, requestId)).limit(1);
  return result[0];
}

// ===== Itens de Pedidos =====
export async function createExamRequestItems(items: InsertExamRequestItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return;
  await db.insert(examRequestItems).values(items);
}

export async function getExamRequestItems(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examRequestItems).where(eq(examRequestItems.examRequestId, requestId));
}

// ===== Resultados de Exames =====
export async function createExamResult(result: InsertExamResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const insertResult = await db.insert(examResults).values(result);
  return insertResult[0].insertId;
}

export async function getExamResultsByRequest(requestId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examResults).where(eq(examResults.examRequestId, requestId)).orderBy(desc(examResults.resultDate));
}

export async function getExamResultById(resultId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(examResults).where(eq(examResults.id, resultId)).limit(1);
  return result[0];
}

export async function updateExamResult(resultId: number, data: Partial<InsertExamResult>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(examResults).set(data).where(eq(examResults.id, resultId));
}

// ===== Itens de Resultados =====
export async function createExamResultItems(items: InsertExamResultItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (items.length === 0) return;
  await db.insert(examResultItems).values(items);
}

export async function getExamResultItems(resultId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(examResultItems).where(eq(examResultItems.examResultId, resultId));
}
