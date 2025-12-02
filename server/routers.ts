import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
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

  examAnalyses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getExamAnalysesByUser } = await import("./db");
      return await getExamAnalysesByUser(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        patientName: z.string().optional(),
        patientIdentifier: z.string().optional(),
        requestText: z.string().optional(),
        requestPdfUrl: z.string().optional(),
        requestPdfKey: z.string().optional(),
        requestDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createExamAnalysis } = await import("./db");
        const { extractExamNamesFromText } = await import("./pdfProcessor");
        
        let requestText = input.requestText || "";
        let requestedExams: string[] = [];
        
        // Se tiver PDF, extrai o texto
        if (input.requestPdfUrl) {
          const { extractTextFromPdfUrl } = await import("./pdfProcessor");
          requestText = await extractTextFromPdfUrl(input.requestPdfUrl);
        }
        
        // Extrai nomes dos exames do texto
        if (requestText) {
          requestedExams = extractExamNamesFromText(requestText);
        }
        
        const analysisId = await createExamAnalysis({
          patientName: input.patientName,
          patientIdentifier: input.patientIdentifier,
          requestText,
          requestPdfUrl: input.requestPdfUrl,
          requestPdfKey: input.requestPdfKey,
          requestDate: input.requestDate ? new Date(input.requestDate) : undefined,
          requestedExams: JSON.stringify(requestedExams),
          createdBy: ctx.user.id,
        });
        
        return { id: analysisId, requestedExamsCount: requestedExams.length };
      }),
    
    addResult: protectedProcedure
      .input(z.object({
        analysisId: z.number(),
        resultFileUrl: z.string(),
        resultFileKey: z.string(),
        resultFileType: z.enum(["pdf", "image"]),
        resultDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { getExamAnalysisById, updateExamAnalysis } = await import("./db");
        const { extractTextFromPdfUrl, extractExamNamesFromText, analyzeCompliance } = await import("./pdfProcessor");
        
        // Busca a análise existente
        const analysis = await getExamAnalysisById(input.analysisId);
        if (!analysis) {
          throw new Error("Análise não encontrada");
        }
        
        // Extrai texto do resultado (apenas se for PDF)
        let resultExtractedText = "";
        let performedExams: string[] = [];
        
        if (input.resultFileType === "pdf") {
          resultExtractedText = await extractTextFromPdfUrl(input.resultFileUrl);
          performedExams = extractExamNamesFromText(resultExtractedText);
        }
        
        // Analisa conformidade
        const requestedExams = analysis.requestedExams ? JSON.parse(analysis.requestedExams) : [];
        const compliance = analyzeCompliance(requestedExams, performedExams);
        
        // Atualiza a análise
        await updateExamAnalysis(input.analysisId, {
          resultFileUrl: input.resultFileUrl,
          resultFileKey: input.resultFileKey,
          resultFileType: input.resultFileType,
          resultExtractedText: resultExtractedText || undefined,
          resultDate: input.resultDate ? new Date(input.resultDate) : undefined,
          performedExams: JSON.stringify(performedExams),
          missingExams: JSON.stringify(compliance.missingExams),
          extraExams: JSON.stringify(compliance.extraExams),
          complianceStatus: compliance.status,
          complianceDetails: JSON.stringify(compliance),
        });
        
        return { 
          success: true, 
          performedExamsCount: performedExams.length,
          compliance 
        };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getExamAnalysisById } = await import("./db");
        const analysis = await getExamAnalysisById(input.id);
        
        if (!analysis) return null;
        
        // Parse JSON fields
        return {
          ...analysis,
          requestedExams: analysis.requestedExams ? JSON.parse(analysis.requestedExams) : [],
          performedExams: analysis.performedExams ? JSON.parse(analysis.performedExams) : [],
          missingExams: analysis.missingExams ? JSON.parse(analysis.missingExams) : [],
          extraExams: analysis.extraExams ? JSON.parse(analysis.extraExams) : [],
          complianceDetails: analysis.complianceDetails ? JSON.parse(analysis.complianceDetails) : null,
        };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteExamAnalysis } = await import("./db");
        await deleteExamAnalysis(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
