/**
 * Módulo de processamento de texto de exames
 * Removida dependência de pdfjs-dist para evitar erros no Node.js
 */

/**
 * Extrai nomes de exames de um texto.
 * Usa heurísticas para identificar linhas que provavelmente contêm nomes de exames.
 */
export function extractExamNamesFromText(text: string): string[] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);

  const examKeywords = [
    'tsh', 't4', 't3', 'fsh', 'lh', 'estradiol', 'progesterona', 'prolactina',
    'testosterona', 'shbg', 'vitamina', 'hemograma', 'glicose', 'glicemia',
    'colesterol', 'triglicérides', 'triglicerídeos', 'hdl', 'ldl', 'vldl',
    'creatinina', 'ureia', 'uréia', 'tgo', 'tgp', 'ggt', 'fosfatase',
    'proteína', 'albumina', 'cálcio', 'calcio', 'pth', 'ferro', 'ferritina',
    'transferrina', 'ácido', 'acido', 'fólico', 'folico', 'homocisteína',
    'homocisteina', 'apolipoproteína', 'apolipoproteina', 'homa', 'insulina',
    'hba1c', 'eas', 'pcr', 'proteína c reativa', 'sódio', 'sodio', 'potássio',
    'potassio', 'magnésio', 'magnesio'
  ];

  // Padrões para filtrar linhas que NÃO são nomes de exames
  const excludePatterns = [
    /^\d+[\.,]\d+/i, // Valores numéricos
    /valor(es)?\s+(de\s+)?referência/i,
    /método/i,
    /resultado(s)?\s+anterior(es)?/i,
    /coleta:/i,
    /liberação:/i,
    /impressão:/i,
    /liberado\s+e\s+assinado/i,
    /página:/i,
    /protocolo:/i,
    /cadastro/i,
    /categoria/i,
    /documento/i,
    /telefone/i,
    /endereço/i,
    /cpf:/i,
    /crm:/i,
    /^dr\./i,
    /^dra\./i,
    /paciente:/i,
    /médico:/i,
    /solicit/i,
    /cid:/i,
    /assinado\s+digitalmente/i,
    /powered\s+by/i,
    /versão:/i,
    /^\s*:\s*$/,
    /^\s*\d+\s*$/,
    /^\s*[a-z]\s*$/i,
    /^(homens?|mulheres?|masculino|feminino|adulto|criança|gestante)/i,
    /fase\s+(folicular|lútea|lutea)/i,
    /pós-menopausa/i,
    /pos-menopausa/i,
    /trimestre/i,
    /^de\s+\d+/i,
    /^até\s+\d+/i,
    /^maior\s+ou\s+igual/i,
    /^menor\s+ou\s+igual/i,
    /^\d+\s+a\s+\d+/i,
    /µ[a-z]+\/[a-z]+/i, // Unidades de medida
    /mg\/dl/i,
    /ng\/ml/i,
    /pg\/ml/i,
    /mmol\/l/i,
    /^soro$/i,
    /^sangue$/i,
    /^urina$/i,
    /^plasma$/i,
    /quimioluminescência/i,
    /elisa/i,
    /turbidimetria/i,
    /colorimétrico/i,
    /^cursor$/i,
    /^atenção/i,
    /^observação/i,
    /^obs:/i,
    /^nota:/i,
    /^interpretação/i,
    /^comentário/i,
    /^referência/i,
    /^fonte:/i,
    /^segundo/i,
    /^conforme/i,
    /^de\s+acordo/i,
    /recomenda/i,
    /sugere/i,
    /indica/i,
    /associado/i,
    /relacionado/i,
    /^a\s+[a-z]+/i, // Começa com "A " (artigo)
    /^o\s+[a-z]+/i, // Começa com "O " (artigo)
    /^os\s+[a-z]+/i,
    /^as\s+[a-z]+/i,
    /é\s+um/i,
    /é\s+uma/i,
    /são\s+os/i,
    /são\s+as/i,
    /\bpode\b/i,
    /\bdevem?\b/i,
    /\bestá\b/i,
    /\bestão\b/i,
    /\bsendo\b/i,
    /\bhavendo\b/i,
    /^\*+/,
    /^\d+[\.\)]/,
    /^[-•]/,
    /.{150,}/, // Linhas muito longas (provavelmente texto descritivo)
  ];

  const exams: string[] = [];
  const seenExams = new Set<string>();

  for (const line of lines) {
    // Pula linhas muito curtas ou muito longas
    if (line.length < 3 || line.length > 100) continue;

    const lineLower = line.toLowerCase();

    // Verifica se deve excluir a linha
    const shouldExclude = excludePatterns.some(pattern => pattern.test(line));
    if (shouldExclude) continue;

    // Verifica se a linha contém palavras-chave de exames
    const hasKeyword = examKeywords.some(keyword => lineLower.includes(keyword));
    if (!hasKeyword) continue;

    // Limpa o nome do exame
    let examName = line
      .replace(/^\d+[\.\)]\s*/, '') // Remove numeração
      .replace(/^[-•]\s*/, '') // Remove marcadores
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();

    // Remove dois pontos no final
    if (examName.endsWith(':')) {
      examName = examName.slice(0, -1).trim();
    }

    // Verifica se já foi adicionado (case-insensitive)
    const examKey = examName.toLowerCase();
    if (seenExams.has(examKey)) continue;

    // Adiciona o exame
    seenExams.add(examKey);
    exams.push(examName);
  }

  return exams;
}

/**
 * Analisa conformidade entre exames solicitados e realizados.
 */
export function analyzeCompliance(
  requestedExams: string[],
  performedExams: string[]
): {
  missingExams: string[];
  extraExams: string[];
  matchedExams: string[];
  complianceStatus: 'complete' | 'partial' | 'pending';
} {
  const missingExams: string[] = [];
  const matchedExams: string[] = [];

  // Normaliza os nomes para comparação
  const performedNormalized = performedExams.map(e => 
    e.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
  );

  for (const requested of requestedExams) {
    const requestedNormalized = requested.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    // Verifica se há match exato ou parcial
    let found = false;
    for (const performed of performedNormalized) {
      // Match se um contém o outro (com pelo menos 4 caracteres)
      if (requestedNormalized.length >= 4 && performed.length >= 4) {
        if (
          performed.includes(requestedNormalized) ||
          requestedNormalized.includes(performed)
        ) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      matchedExams.push(requested);
    } else {
      missingExams.push(requested);
    }
  }

  // Identifica exames extras (realizados mas não solicitados)
  const extraExams: string[] = [];
  const requestedNormalized = requestedExams.map(e =>
    e.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
  );

  for (const performed of performedExams) {
    const performedNormalized = performed.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íìî]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úùû]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

    let found = false;
    for (const requested of requestedNormalized) {
      if (performedNormalized.length >= 4 && requested.length >= 4) {
        if (
          requested.includes(performedNormalized) ||
          performedNormalized.includes(requested)
        ) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      extraExams.push(performed);
    }
  }

  // Determina status de conformidade
  let complianceStatus: 'complete' | 'partial' | 'pending';
  if (performedExams.length === 0) {
    complianceStatus = 'pending';
  } else if (missingExams.length === 0) {
    complianceStatus = 'complete';
  } else {
    complianceStatus = 'partial';
  }

  return {
    missingExams,
    extraExams,
    matchedExams,
    complianceStatus,
  };
}
