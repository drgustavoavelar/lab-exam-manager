import { describe, expect, it, beforeAll } from "vitest";
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

describe("patients", () => {
  it("should list patients for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const patients = await caller.patients.list();

    expect(Array.isArray(patients)).toBe(true);
  });

  it("should create a new patient", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.patients.create({
      name: "João Silva",
      cpf: "123.456.789-00",
      email: "joao@example.com",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should get patient by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Cria um paciente primeiro
    const created = await caller.patients.create({
      name: "Maria Santos",
      email: "maria@example.com",
    });

    // Busca o paciente
    const patient = await caller.patients.getById({ id: created.id });

    expect(patient).toBeDefined();
    expect(patient?.name).toBe("Maria Santos");
    expect(patient?.email).toBe("maria@example.com");
  });

  it("should update patient information", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Cria um paciente
    const created = await caller.patients.create({
      name: "Pedro Costa",
    });

    // Atualiza o paciente
    const updateResult = await caller.patients.update({
      id: created.id,
      name: "Pedro Costa Silva",
      phone: "(11) 99999-9999",
    });

    expect(updateResult.success).toBe(true);

    // Verifica a atualização
    const updated = await caller.patients.getById({ id: created.id });
    expect(updated?.name).toBe("Pedro Costa Silva");
    expect(updated?.phone).toBe("(11) 99999-9999");
  });
});
