import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("examAnalyses", () => {
  it("should list exam analyses for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const analyses = await caller.examAnalyses.list();

    expect(Array.isArray(analyses)).toBe(true);
  });

  it("should create a new exam analysis with text", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.examAnalyses.create({
      patientName: "João Silva",
      requestText: "Hemograma completo\nGlicose em jejum\nColesterol total",
      requestDate: new Date().toISOString(),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    expect(result.requestedExamsCount).toBeGreaterThanOrEqual(0);
  });

  it("should get exam analysis by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Cria uma análise primeiro
    const created = await caller.examAnalyses.create({
      patientName: "Maria Santos",
      requestText: "TSH\nT4 livre\nCreatinina",
    });

    // Busca a análise
    const analysis = await caller.examAnalyses.getById({ id: created.id });

    expect(analysis).toBeDefined();
    expect(analysis?.patientName).toBe("Maria Santos");
    expect(analysis?.requestedExams).toBeDefined();
    expect(Array.isArray(analysis?.requestedExams)).toBe(true);
  });

  it("should delete exam analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Cria uma análise
    const created = await caller.examAnalyses.create({
      requestText: "Urina tipo 1\nFezes",
    });

    // Deleta a análise
    const deleteResult = await caller.examAnalyses.delete({ id: created.id });

    expect(deleteResult.success).toBe(true);

    // Verifica que foi deletada
    const analysis = await caller.examAnalyses.getById({ id: created.id });
    expect(analysis).toBeUndefined();
  });
});
