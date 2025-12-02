/**
 * Módulo de processamento de texto de exames
 * Removida dependência de pdfjs-dist para evitar erros no Node.js
 */

/**
 * Extrai nomes de exames de um texto
 * Esta é uma implementação básica que identifica linhas que parecem ser nomes de exames
 */
export function extractExamNamesFromText(text: string): string[] {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 2 && line.length < 200); // Filtrar linhas muito curtas ou muito longas
  
  // Palavras-chave comuns em pedidos de exames
  const examKeywords = [
    "hemograma",
    "glicose",
    "glicemia",
    "colesterol",
    "triglicérides",
    "triglicerídeos",
    "creatinina",
    "ureia",
    "uréia",
    "tgo",
    "tgp",
    "ggt",
    "fosfatase",
    "bilirrubina",
    "proteína",
    "albumina",
    "globulina",
    "tsh",
    "t3",
    "t4",
    "tiroxina",
    "fsh",
    "lh",
    "estradiol",
    "progesterona",
    "prolactina",
    "testosterona",
    "shbg",
    "vitamina",
    "ferro",
    "ferritina",
    "transferrina",
    "ácido",
    "acido",
    "fólico",
    "folico",
    "homocisteína",
    "homocisteina",
    "cálcio",
    "calcio",
    "magnésio",
    "magnesio",
    "sódio",
    "sodio",
    "potássio",
    "potassio",
    "pth",
    "paratormônio",
    "apolipoproteína",
    "apolipoproteina",
    "hdl",
    "ldl",
    "vldl",
    "homa",
    "insulina",
    "hba1c",
    "hemoglobina glicada",
    "eas",
    "urina",
    "fezes",
    "parasitológico",
    "parasitologico",
    "cultura",
    "antibiograma",
    "pcr",
    "proteína c reativa",
    "proteina c reativa",
    "vhs",
    "eletroforese",
  ];
  
  const exams: string[] = [];
  const seenExams = new Set<string>();
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    
    // Verifica se a linha contém alguma palavra-chave de exame
    const hasKeyword = examKeywords.some(keyword => lineLower.includes(keyword));
    
    // Verifica se não parece ser cabeçalho, rodapé ou texto descritivo
    const looksLikeExam = 
      hasKeyword &&
      !lineLower.includes("laboratório") &&
      !lineLower.includes("laboratorio") &&
      !lineLower.includes("resultado") &&
      !lineLower.includes("paciente") &&
      !lineLower.includes("médico") &&
      !lineLower.includes("medico") &&
      !lineLower.includes("data") &&
      !lineLower.includes("página") &&
      !lineLower.includes("pagina") &&
      !lineLower.includes("protocolo") &&
      !lineLower.includes("cadastro") &&
      !lineLower.includes("telefone") &&
      !lineLower.includes("endereço") &&
      !lineLower.includes("endereco") &&
      !lineLower.includes("cpf") &&
      !lineLower.includes("crm") &&
      !lineLower.includes("cnes");
    
    if (looksLikeExam) {
      // Limpa e normaliza o nome do exame
      let examName = line
        .replace(/^\d+[\.\)]\s*/, "") // Remove numeração no início
        .replace(/^[-•]\s*/, "") // Remove marcadores
        .trim();
      
      // Evita duplicatas (case-insensitive)
      const examKey = examName.toLowerCase();
      if (examName && !seenExams.has(examKey)) {
        seenExams.add(examKey);
        exams.push(examName);
      }
    }
  }
  
  // Se não encontrou nenhum exame com as palavras-chave, tenta uma abordagem mais simples
  // Considera cada linha não vazia como um possível exame
  if (exams.length === 0) {
    for (const line of lines) {
      // Ignora linhas que parecem ser cabeçalhos ou rodapés
      if (
        line.length > 3 &&
        line.length < 150 &&
        !line.toLowerCase().includes("solicitação") &&
        !line.toLowerCase().includes("solicitacao") &&
        !line.toLowerCase().includes("pedido") &&
        !line.toLowerCase().includes("exemplo:") &&
        !line.toLowerCase().includes("cole aqui")
      ) {
        let examName = line
          .replace(/^\d+[\.\)]\s*/, "")
          .replace(/^[-•]\s*/, "")
          .trim();
        
        const examKey = examName.toLowerCase();
        if (examName && !seenExams.has(examKey)) {
          seenExams.add(examKey);
          exams.push(examName);
        }
      }
    }
  }
  
  return exams;
}

/**
 * Analisa conformidade entre exames solicitados e realizados
 */
export function analyzeCompliance(
  requestedExams: string[],
  performedExams: string[]
): {
  missingExams: string[];
  extraExams: string[];
  matchedExams: string[];
  complianceStatus: "complete" | "partial" | "pending";
} {
  const requestedSet = new Set(requestedExams.map(e => e.toLowerCase().trim()));
  const performedSet = new Set(performedExams.map(e => e.toLowerCase().trim()));
  
  const missingExams: string[] = [];
  const matchedExams: string[] = [];
  
  // Verifica exames solicitados que foram realizados
  for (const requested of requestedExams) {
    const requestedLower = requested.toLowerCase().trim();
    let found = false;
    
    // Busca exata
    if (performedSet.has(requestedLower)) {
      matchedExams.push(requested);
      found = true;
    } else {
      // Busca parcial (contém)
      for (const performed of performedExams) {
        const performedLower = performed.toLowerCase().trim();
        if (
          performedLower.includes(requestedLower) ||
          requestedLower.includes(performedLower)
        ) {
          matchedExams.push(requested);
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      missingExams.push(requested);
    }
  }
  
  // Verifica exames realizados que não foram solicitados
  const extraExams: string[] = [];
  for (const performed of performedExams) {
    const performedLower = performed.toLowerCase().trim();
    let found = false;
    
    for (const requested of requestedExams) {
      const requestedLower = requested.toLowerCase().trim();
      if (
        requestedLower.includes(performedLower) ||
        performedLower.includes(requestedLower)
      ) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      extraExams.push(performed);
    }
  }
  
  // Determina status de conformidade
  let complianceStatus: "complete" | "partial" | "pending";
  if (performedExams.length === 0) {
    complianceStatus = "pending";
  } else if (missingExams.length === 0) {
    complianceStatus = "complete";
  } else {
    complianceStatus = "partial";
  }
  
  return {
    missingExams,
    extraExams,
    matchedExams,
    complianceStatus,
  };
}
