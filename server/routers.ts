import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  patients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getPatientsByUser } = await import("./db");
      return await getPatientsByUser(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpf: z.string().optional(),
        birthDate: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createPatient } = await import("./db");
        const patientId = await createPatient({
          ...input,
          birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
          createdBy: ctx.user.id,
        });
        return { id: patientId };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getPatientById } = await import("./db");
        return await getPatientById(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpf: z.string().optional(),
        birthDate: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updatePatient } = await import("./db");
        const { id, ...data } = input;
        await updatePatient(id, {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        });
        return { success: true };
      }),
  }),

  examRequests: router({
    listByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        const { getExamRequestsByPatient } = await import("./db");
        return await getExamRequestsByPatient(input.patientId);
      }),
    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        requestDate: z.string(),
        doctorName: z.string().optional(),
        pdfUrl: z.string(),
        pdfKey: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createExamRequest, createExamRequestItems } = await import("./db");
        const { extractTextFromPdfUrl, extractExamNamesFromText } = await import("./pdfProcessor");
        
        // Extrai texto do PDF
        const extractedText = await extractTextFromPdfUrl(input.pdfUrl);
        const examNames = extractExamNamesFromText(extractedText);
        
        // Cria o pedido
        const requestId = await createExamRequest({
          ...input,
          requestDate: new Date(input.requestDate),
          extractedText,
          createdBy: ctx.user.id,
        });
        
        // Cria os itens do pedido
        if (examNames.length > 0) {
          await createExamRequestItems(
            examNames.map(name => ({
              examRequestId: requestId,
              examName: name,
            }))
          );
        }
        
        return { id: requestId, examCount: examNames.length };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getExamRequestById, getExamRequestItems } = await import("./db");
        const request = await getExamRequestById(input.id);
        if (!request) return null;
        const items = await getExamRequestItems(input.id);
        return { ...request, items };
      }),
  }),

  examResults: router({
    listByRequest: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .query(async ({ input }) => {
        const { getExamResultsByRequest } = await import("./db");
        return await getExamResultsByRequest(input.requestId);
      }),
    create: protectedProcedure
      .input(z.object({
        examRequestId: z.number(),
        resultDate: z.string(),
        laboratoryName: z.string().optional(),
        pdfUrl: z.string(),
        pdfKey: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createExamResult, createExamResultItems, getExamRequestItems, updateExamResult } = await import("./db");
        const { extractTextFromPdfUrl, extractExamNamesFromText, analyzeCompliance } = await import("./pdfProcessor");
        
        // Extrai texto do PDF
        const extractedText = await extractTextFromPdfUrl(input.pdfUrl);
        const examNames = extractExamNamesFromText(extractedText);
        
        // Cria o resultado
        const resultId = await createExamResult({
          ...input,
          resultDate: new Date(input.resultDate),
          extractedText,
          createdBy: ctx.user.id,
          complianceStatus: "not_analyzed",
        });
        
        // Cria os itens do resultado
        if (examNames.length > 0) {
          await createExamResultItems(
            examNames.map(name => ({
              examResultId: resultId,
              examName: name,
            }))
          );
        }
        
        // Analisa conformidade
        const requestItems = await getExamRequestItems(input.examRequestId);
        const requestedExams = requestItems.map(item => item.examName);
        const compliance = analyzeCompliance(requestedExams, examNames);
        
        // Atualiza o resultado com a análise
        await updateExamResult(resultId, {
          complianceStatus: compliance.status,
          complianceDetails: JSON.stringify(compliance),
        });
        
        return { id: resultId, examCount: examNames.length, compliance };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getExamResultById, getExamResultItems } = await import("./db");
        const result = await getExamResultById(input.id);
        if (!result) return null;
        const items = await getExamResultItems(input.id);
        return { ...result, items };
      }),
  }),
});

export type AppRouter = typeof appRouter;
