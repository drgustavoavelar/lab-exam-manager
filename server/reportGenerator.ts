import type { ExamAnalysis } from "../drizzle/schema";

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
 * Gera relatório de não conformidade em formato de texto
 */
export function generateComplianceReport(analysis: ReportData): string {
  const lines: string[] = [];
  
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("        RELATÓRIO DE CONFORMIDADE DE EXAMES");
  lines.push("              Instituto Elo de Saúde");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("");
  
  // Informações do paciente
  if (analysis.patientName) {
    lines.push(`Paciente: ${analysis.patientName}`);
  }
  if (analysis.patientIdentifier) {
    lines.push(`Identificador: ${analysis.patientIdentifier}`);
  }
  lines.push(`Data de Emissão: ${new Date().toLocaleDateString("pt-BR", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })}`);
  lines.push("");
  
  if (analysis.requestDate) {
    lines.push(`Data do Pedido: ${new Date(analysis.requestDate).toLocaleDateString("pt-BR")}`);
  }
  if (analysis.resultDate) {
    lines.push(`Data do Resultado: ${new Date(analysis.resultDate).toLocaleDateString("pt-BR")}`);
  }
  lines.push("");
  
  // Status de conformidade
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("STATUS DE CONFORMIDADE");
  lines.push("───────────────────────────────────────────────────────────");
  
  let statusText = "";
  switch (analysis.complianceStatus) {
    case "complete":
      statusText = "✓ COMPLETO - Todos os exames solicitados foram realizados";
      break;
    case "partial":
      statusText = "⚠ PARCIAL - Alguns exames solicitados não foram realizados";
      break;
    case "pending":
      statusText = "⏳ PENDENTE - Aguardando realização dos exames";
      break;
    default:
      statusText = "• NÃO ANALISADO";
  }
  lines.push(statusText);
  lines.push("");
  
  // Resumo quantitativo
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("RESUMO QUANTITATIVO");
  lines.push("───────────────────────────────────────────────────────────");
  lines.push(`Total de exames solicitados: ${analysis.requestedExams.length}`);
  lines.push(`Total de exames realizados: ${analysis.performedExams.length}`);
  lines.push(`Exames faltantes: ${analysis.missingExams.length}`);
  if (analysis.extraExams.length > 0) {
    lines.push(`Exames adicionais (não solicitados): ${analysis.extraExams.length}`);
  }
  lines.push("");
  
  // Exames solicitados
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("EXAMES SOLICITADOS");
  lines.push("───────────────────────────────────────────────────────────");
  if (analysis.requestedExams.length > 0) {
    analysis.requestedExams.forEach((exam, index) => {
      lines.push(`${index + 1}. ${exam}`);
    });
  } else {
    lines.push("Nenhum exame identificado no pedido.");
  }
  lines.push("");
  
  // Exames realizados
  lines.push("───────────────────────────────────────────────────────────");
  lines.push("EXAMES REALIZADOS");
  lines.push("───────────────────────────────────────────────────────────");
  if (analysis.performedExams.length > 0) {
    analysis.performedExams.forEach((exam, index) => {
      lines.push(`${index + 1}. ✓ ${exam}`);
    });
  } else {
    lines.push("Nenhum exame identificado no resultado.");
  }
  lines.push("");
  
  // Exames faltantes (DESTAQUE)
  if (analysis.missingExams.length > 0) {
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("⚠ EXAMES FALTANTES - NÃO CONFORMIDADE");
    lines.push("═══════════════════════════════════════════════════════════");
    lines.push("");
    lines.push("Os seguintes exames foram SOLICITADOS mas NÃO CONSTAM");
    lines.push("no resultado apresentado:");
    lines.push("");
    analysis.missingExams.forEach((exam, index) => {
      lines.push(`${index + 1}. ✗ ${exam}`);
    });
    lines.push("");
    lines.push("AÇÃO REQUERIDA: Verificar com o laboratório a realização");
    lines.push("dos exames listados acima.");
    lines.push("");
  }
  
  // Exames adicionais
  if (analysis.extraExams.length > 0) {
    lines.push("───────────────────────────────────────────────────────────");
    lines.push("EXAMES ADICIONAIS (NÃO SOLICITADOS)");
    lines.push("───────────────────────────────────────────────────────────");
    analysis.extraExams.forEach((exam, index) => {
      lines.push(`${index + 1}. + ${exam}`);
    });
    lines.push("");
  }
  
  // Rodapé
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("Este relatório foi gerado automaticamente pelo sistema");
  lines.push("de Compatibilidade de Exames do Instituto Elo de Saúde.");
  lines.push("═══════════════════════════════════════════════════════════");
  
  return lines.join("\n");
}

/**
 * Gera relatório resumido focado apenas nos exames faltantes
 */
export function generateMissingExamsReport(analysis: ReportData): string {
  const lines: string[] = [];
  
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("     RELATÓRIO DE EXAMES FALTANTES");
  lines.push("        Instituto Elo de Saúde");
  lines.push("═══════════════════════════════════════════════════════════");
  lines.push("");
  
  if (analysis.patientName) {
    lines.push(`Paciente: ${analysis.patientName}`);
  }
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("");
  
  if (analysis.missingExams.length === 0) {
    lines.push("✓ CONFORMIDADE COMPLETA");
    lines.push("");
    lines.push("Todos os exames solicitados foram realizados.");
    lines.push("Não há pendências.");
  } else {
    lines.push(`⚠ ${analysis.missingExams.length} EXAME(S) FALTANTE(S)`);
    lines.push("");
    lines.push("Os seguintes exames foram solicitados mas NÃO CONSTAM");
    lines.push("no resultado:");
    lines.push("");
    
    analysis.missingExams.forEach((exam, index) => {
      lines.push(`  ${index + 1}. ${exam}`);
    });
    
    lines.push("");
    lines.push("AÇÃO NECESSÁRIA:");
    lines.push("• Entrar em contato com o laboratório");
    lines.push("• Verificar se os exames foram realizados");
    lines.push("• Solicitar complementação do resultado");
  }
  
  lines.push("");
  lines.push("═══════════════════════════════════════════════════════════");
  
  return lines.join("\n");
}
