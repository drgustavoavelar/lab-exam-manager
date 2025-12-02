import { invokeLLM } from "./_core/llm";

/**
 * Extrai nomes de exames de um texto usando IA
 * Muito mais preciso que regex, pois entende contexto
 */
export async function extractExamNamesWithAI(text: string): Promise<string[]> {
  try {
    const prompt = `Você é um especialista em análise de documentos médicos. Analise o texto abaixo e extraia APENAS os nomes dos exames laboratoriais mencionados.

REGRAS IMPORTANTES:
1. Extraia APENAS nomes de exames (TSH, Hemograma, Glicemia, etc.)
2. NÃO inclua: valores de referência, métodos, texto descritivo, observações, nomes de pacientes, médicos, laboratórios
3. NÃO inclua: linhas que começam com artigos ("A vitamina...", "O exame...")
4. NÃO inclua: texto explicativo sobre doenças ou interpretações
5. Normalize os nomes (ex: "TSH ULTRA SENSÍVEL" → "TSH")
6. Agrupe exames relacionados quando solicitados juntos (ex: "Colesterol total, HDL, LDL" → "Colesterol total, HDL, LDL")
7. Retorne um JSON array de strings com os nomes dos exames

TEXTO:
${text.substring(0, 8000)}

Retorne APENAS um JSON array, exemplo: ["TSH", "T4 livre", "Hemograma completo"]`;

    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "exam_list",
          strict: true,
          schema: {
            type: "object",
            properties: {
              exams: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Lista de nomes de exames laboratoriais extraídos do texto",
              },
            },
            required: ["exams"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("LLM não retornou conteúdo válido");
    }

    const parsed = JSON.parse(content);
    return parsed.exams || [];
  } catch (error) {
    console.error("Erro ao extrair exames com IA:", error);
    // Fallback para extração básica em caso de erro
    return [];
  }
}

/**
 * Analisa conformidade entre exames solicitados e realizados usando IA
 * Mais inteligente que comparação de strings, pois entende sinônimos e variações
 */
export async function analyzeComplianceWithAI(
  requestedExams: string[],
  performedExams: string[]
): Promise<{
  missingExams: string[];
  matchedExams: string[];
  extraExams: string[];
  complianceStatus: "complete" | "partial" | "pending";
}> {
  try {
    const prompt = `Você é um especialista em análise de conformidade de exames laboratoriais.

EXAMES SOLICITADOS:
${requestedExams.map((e, i) => `${i + 1}. ${e}`).join('\n')}

EXAMES REALIZADOS:
${performedExams.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Analise a conformidade considerando:
1. Sinônimos e variações de nomenclatura (ex: "TSH" = "TSH ULTRA SENSÍVEL")
2. Exames agrupados (ex: "Colesterol total, HDL, LDL" pode ser 3 exames separados)
3. Abreviações comuns (ex: "HB A1C" = "Hemoglobina Glicada" = "HbA1c")

Retorne um JSON com:
- missingExams: exames solicitados que NÃO foram realizados
- matchedExams: exames solicitados que FORAM realizados
- extraExams: exames realizados que NÃO foram solicitados`;

    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "compliance_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              missingExams: {
                type: "array",
                items: { type: "string" },
                description: "Exames solicitados mas não realizados",
              },
              matchedExams: {
                type: "array",
                items: { type: "string" },
                description: "Exames solicitados e realizados",
              },
              extraExams: {
                type: "array",
                items: { type: "string" },
                description: "Exames realizados mas não solicitados",
              },
            },
            required: ["missingExams", "matchedExams", "extraExams"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("LLM não retornou conteúdo válido");
    }

    const parsed = JSON.parse(content);

    let complianceStatus: "complete" | "partial" | "pending";
    if (performedExams.length === 0) {
      complianceStatus = "pending";
    } else if (parsed.missingExams.length === 0) {
      complianceStatus = "complete";
    } else {
      complianceStatus = "partial";
    }

    return {
      missingExams: parsed.missingExams || [],
      matchedExams: parsed.matchedExams || [],
      extraExams: parsed.extraExams || [],
      complianceStatus,
    };
  } catch (error) {
    console.error("Erro ao analisar conformidade com IA:", error);
    // Fallback para análise básica
    return {
      missingExams: requestedExams,
      matchedExams: [],
      extraExams: performedExams,
      complianceStatus: "pending",
    };
  }
}
