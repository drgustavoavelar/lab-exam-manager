import PDFDocument from "pdfkit";
import type { Readable } from "stream";

interface ReportData {
  patientName?: string | null;
  patientIdentifier?: string | null;
  requestDate?: Date | null;
  resultDate?: Date | null;
  requestedExams: string[];
  performedExams: string[];
  missingExams: string[];
  extraExams: string[];
  complianceStatus: string;
}

/**
 * Gera PDF do relatório de conformidade
 */
export function generateCompliancePDF(analysis: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: "A4", 
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const buffers: Buffer[] = [];
      
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
      
      // Cabeçalho
      doc.fontSize(20).font("Helvetica-Bold").text("RELATÓRIO DE CONFORMIDADE DE EXAMES", { align: "center" });
      doc.fontSize(14).font("Helvetica").text("Instituto Elo de Saúde", { align: "center" });
      doc.moveDown(1);
      
      // Linha separadora
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      
      // Informações do paciente
      doc.fontSize(12).font("Helvetica-Bold");
      if (analysis.patientName) {
        doc.text(`Paciente: `, { continued: true }).font("Helvetica").text(analysis.patientName);
      }
      if (analysis.patientIdentifier) {
        doc.font("Helvetica-Bold").text(`Identificador: `, { continued: true }).font("Helvetica").text(analysis.patientIdentifier);
      }
      doc.font("Helvetica-Bold").text(`Data de Emissão: `, { continued: true })
        .font("Helvetica").text(new Date().toLocaleDateString("pt-BR", { 
          day: "2-digit", 
          month: "2-digit", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }));
      doc.moveDown(0.5);
      
      if (analysis.requestDate) {
        doc.font("Helvetica-Bold").text(`Data do Pedido: `, { continued: true })
          .font("Helvetica").text(new Date(analysis.requestDate).toLocaleDateString("pt-BR"));
      }
      if (analysis.resultDate) {
        doc.font("Helvetica-Bold").text(`Data do Resultado: `, { continued: true })
          .font("Helvetica").text(new Date(analysis.resultDate).toLocaleDateString("pt-BR"));
      }
      doc.moveDown(1);
      
      // Status de conformidade
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica-Bold").text("STATUS DE CONFORMIDADE");
      doc.moveDown(0.5);
      
      let statusText = "";
      let statusColor: [number, number, number] = [0, 0, 0];
      switch (analysis.complianceStatus) {
        case "complete":
          statusText = "✓ COMPLETO - Todos os exames solicitados foram realizados";
          statusColor = [0, 128, 0];
          break;
        case "partial":
          statusText = "⚠ PARCIAL - Alguns exames solicitados não foram realizados";
          statusColor = [255, 140, 0];
          break;
        case "pending":
          statusText = "⏳ PENDENTE - Aguardando realização dos exames";
          statusColor = [128, 128, 128];
          break;
        default:
          statusText = "• NÃO ANALISADO";
      }
      
      doc.fontSize(12).font("Helvetica-Bold").fillColor(statusColor).text(statusText);
      doc.fillColor([0, 0, 0]);
      doc.moveDown(1);
      
      // Resumo quantitativo
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(14).font("Helvetica-Bold").text("RESUMO QUANTITATIVO");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica");
      doc.text(`Total de exames solicitados: ${analysis.requestedExams.length}`);
      doc.text(`Total de exames realizados: ${analysis.performedExams.length}`);
      doc.text(`Exames faltantes: ${analysis.missingExams.length}`);
      if (analysis.extraExams.length > 0) {
        doc.text(`Exames adicionais (não solicitados): ${analysis.extraExams.length}`);
      }
      doc.moveDown(1);
      
      // Exames faltantes (DESTAQUE)
      if (analysis.missingExams.length > 0) {
        doc.addPage();
        
        doc.fontSize(16).font("Helvetica-Bold").fillColor([220, 20, 60])
          .text("⚠ EXAMES FALTANTES - NÃO CONFORMIDADE", { align: "center" });
        doc.fillColor([0, 0, 0]);
        doc.moveDown(1);
        
        doc.fontSize(11).font("Helvetica")
          .text("Os seguintes exames foram SOLICITADOS mas NÃO CONSTAM no resultado apresentado:");
        doc.moveDown(0.5);
        
        analysis.missingExams.forEach((exam, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          doc.fontSize(11).font("Helvetica-Bold").text(`${index + 1}. `, { continued: true })
            .font("Helvetica").fillColor([220, 20, 60]).text(`✗ ${exam}`);
          doc.fillColor([0, 0, 0]);
        });
        
        doc.moveDown(1);
        doc.fontSize(11).font("Helvetica-Bold").text("AÇÃO REQUERIDA:");
        doc.font("Helvetica").text("Verificar com o laboratório a realização dos exames listados acima.");
        doc.moveDown(1);
      }
      
      // Exames solicitados
      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("EXAMES SOLICITADOS");
      doc.moveDown(0.5);
      
      if (analysis.requestedExams.length > 0) {
        analysis.requestedExams.forEach((exam, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          doc.fontSize(10).font("Helvetica").text(`${index + 1}. ${exam}`);
        });
      } else {
        doc.fontSize(10).font("Helvetica-Oblique").text("Nenhum exame identificado no pedido.");
      }
      doc.moveDown(1);
      
      // Exames realizados
      doc.fontSize(14).font("Helvetica-Bold").text("EXAMES REALIZADOS");
      doc.moveDown(0.5);
      
      if (analysis.performedExams.length > 0) {
        analysis.performedExams.forEach((exam, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          doc.fontSize(10).font("Helvetica").fillColor([0, 128, 0]).text(`${index + 1}. ✓ ${exam}`);
          doc.fillColor([0, 0, 0]);
        });
      } else {
        doc.fontSize(10).font("Helvetica-Oblique").text("Nenhum exame identificado no resultado.");
      }
      doc.moveDown(1);
      
      // Exames adicionais
      if (analysis.extraExams.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }
        doc.fontSize(14).font("Helvetica-Bold").text("EXAMES ADICIONAIS (NÃO SOLICITADOS)");
        doc.moveDown(0.5);
        
        analysis.extraExams.forEach((exam, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }
          doc.fontSize(10).font("Helvetica").text(`${index + 1}. + ${exam}`);
        });
        doc.moveDown(1);
      }
      
      // Rodapé
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font("Helvetica-Oblique").fillColor([128, 128, 128]);
        doc.text(
          `Página ${i + 1} de ${pageCount} - Gerado automaticamente pelo Sistema de Compatibilidade de Exames`,
          50,
          750,
          { align: "center", width: 495 }
        );
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
