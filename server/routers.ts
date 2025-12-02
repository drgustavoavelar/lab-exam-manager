import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";

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
        if (input.requestPdfUrl && !requestText) {
          const { extractTextFromPdfUrl } = await import("./pdfExtractor");
          try {
            requestText = await extractTextFromPdfUrl(input.requestPdfUrl);
          } catch (error) {
            console.error("Erro ao extrair PDF do pedido:", error);
            throw new Error("Não foi possível processar o PDF. Por favor, cole o texto manualmente.");
          }
        }
        
        // Extrai nomes dos exames do texto usando IA com timeout
        if (requestText) {
          const { extractExamNamesWithAI } = await import("./intelligentExtractor");
          const { withTimeout } = await import("./aiWithTimeout");
          try {
            // Timeout de 30 segundos para IA
            requestedExams = await withTimeout(
              extractExamNamesWithAI(requestText),
              30000,
              "Extração com IA excedeu 30 segundos"
            );
            console.log(`✓ Extração com IA concluída: ${requestedExams.length} exames`);
          } catch (error) {
            console.error("Erro na extração com IA, usando fallback:", error);
            requestedExams = extractExamNamesFromText(requestText);
            console.log(`✓ Fallback concluído: ${requestedExams.length} exames`);
          }
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
        const { extractExamNamesFromText, analyzeCompliance } = await import("./pdfProcessor");
        
        // Busca a análise existente
        const analysis = await getExamAnalysisById(input.analysisId);
        if (!analysis) {
          throw new Error("Análise não encontrada");
        }
        
        // Extrai texto do resultado
        let resultExtractedText = "";
        let performedExams: string[] = [];
        
        if (input.resultFileType === "pdf") {
          const { extractTextFromPdfUrl } = await import("./pdfExtractor");
          const { extractExamNamesWithAI } = await import("./intelligentExtractor");
          const { withTimeout } = await import("./aiWithTimeout");
          try {
            resultExtractedText = await extractTextFromPdfUrl(input.resultFileUrl);
            // Tenta extrair com IA primeiro com timeout
            try {
              performedExams = await withTimeout(
                extractExamNamesWithAI(resultExtractedText),
                30000,
                "Extração com IA excedeu 30 segundos"
              );
              console.log(`✓ Extração do resultado com IA: ${performedExams.length} exames`);
            } catch (aiError) {
              console.error("Erro na extração com IA, usando fallback:", aiError);
              performedExams = extractExamNamesFromText(resultExtractedText);
              console.log(`✓ Fallback do resultado: ${performedExams.length} exames`);
            }
          } catch (error) {
            console.error("Erro ao extrair PDF do resultado:", error);
            // Continua sem extrair texto automaticamente
          }
        } else if (input.resultFileType === "image") {
          // Por enquanto, não processa imagens automaticamente
          console.log("Imagem recebida, OCR não implementado ainda");
        }
        
        // Analisa conformidade usando IA com timeout
        const requestedExams = analysis.requestedExams ? JSON.parse(analysis.requestedExams) : [];
        const { analyzeComplianceWithAI } = await import("./intelligentExtractor");
        const { withTimeout } = await import("./aiWithTimeout");
        let compliance;
        try {
          compliance = await withTimeout(
            analyzeComplianceWithAI(requestedExams, performedExams),
            30000,
            "Análise com IA excedeu 30 segundos"
          );
          console.log(`✓ Análise com IA concluída`);
        } catch (error) {
          console.error("Erro na análise com IA, usando fallback:", error);
          compliance = analyzeCompliance(requestedExams, performedExams);
          console.log(`✓ Fallback de análise concluído`);
        }
        
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
          complianceStatus: compliance.complianceStatus,
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
    
    generateReport: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getExamAnalysisById } = await import("./db");
        const { generateComplianceReport, generateMissingExamsReport } = await import("./reportGenerator");
        
        const analysis = await getExamAnalysisById(input.id);
        if (!analysis) {
          throw new Error("Análise não encontrada");
        }
        
        const reportData = {
          patientName: analysis.patientName,
          patientIdentifier: analysis.patientIdentifier,
          requestDate: analysis.requestDate,
          resultDate: analysis.resultDate,
          requestedExams: analysis.requestedExams ? JSON.parse(analysis.requestedExams) : [],
          performedExams: analysis.performedExams ? JSON.parse(analysis.performedExams) : [],
          missingExams: analysis.missingExams ? JSON.parse(analysis.missingExams) : [],
          extraExams: analysis.extraExams ? JSON.parse(analysis.extraExams) : [],
          complianceStatus: analysis.complianceStatus,
        };
        
        const fullReport = generateComplianceReport(reportData);
        const missingReport = generateMissingExamsReport(reportData);
        
        return { fullReport, missingReport };
      }),
    
    downloadPDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getExamAnalysisById } = await import("./db");
        const { generateCompliancePDF } = await import("./pdfGenerator");
        const { storagePut } = await import("./storage");
        
        const analysis = await getExamAnalysisById(input.id);
        if (!analysis) {
          throw new Error("Análise não encontrada");
        }
        
        const reportData = {
          patientName: analysis.patientName,
          patientIdentifier: analysis.patientIdentifier,
          requestDate: analysis.requestDate,
          resultDate: analysis.resultDate,
          requestedExams: analysis.requestedExams ? JSON.parse(analysis.requestedExams) : [],
          performedExams: analysis.performedExams ? JSON.parse(analysis.performedExams) : [],
          missingExams: analysis.missingExams ? JSON.parse(analysis.missingExams) : [],
          extraExams: analysis.extraExams ? JSON.parse(analysis.extraExams) : [],
          complianceStatus: analysis.complianceStatus,
        };
        
        const pdfBuffer = await generateCompliancePDF(reportData);
        const fileName = `relatorio-conformidade-${input.id}-${Date.now()}.pdf`;
        const fileKey = `reports/${fileName}`;
        
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        
        return { url, fileName };
      }),
  }),
});

export type AppRouter = typeof appRouter;
