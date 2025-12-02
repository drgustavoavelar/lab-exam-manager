import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

/**
 * Extrai texto de um PDF a partir de uma URL
 */
export async function extractTextFromPdfUrl(pdfUrl: string): Promise<string> {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });
    
    const pdfBuffer = new Uint8Array(response.data);
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText;
  } catch (error) {
    console.error("Erro ao extrair texto do PDF:", error);
    throw new Error("Falha ao processar o PDF");
  }
}

/**
 * Extrai nomes de exames de um texto extraído de PDF
 * Esta é uma implementação básica que pode ser melhorada com IA
 */
export function extractExamNamesFromText(text: string): string[] {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
  // Palavras-chave comuns em pedidos de exames
  const examKeywords = [
    "hemograma",
    "glicose",
    "colesterol",
    "triglicerídeos",
    "creatinina",
    "ureia",
    "tgo",
    "tgp",
    "gama gt",
    "fosfatase alcalina",
    "bilirrubina",
    "ácido úrico",
    "proteínas totais",
    "albumina",
    "globulina",
    "cálcio",
    "fósforo",
    "magnésio",
    "sódio",
    "potássio",
    "ferro",
    "ferritina",
    "vitamina",
    "tsh",
    "t3",
    "t4",
    "psa",
    "beta hcg",
    "urina",
    "fezes",
    "cultura",
    "raio x",
    "ultrassom",
    "tomografia",
    "ressonância",
    "eletrocardiograma",
    "ecocardiograma",
  ];
  
  const foundExams: string[] = [];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Verifica se a linha contém alguma palavra-chave de exame
    for (const keyword of examKeywords) {
      if (lowerLine.includes(keyword)) {
        foundExams.push(line);
        break;
      }
    }
  }
  
  return foundExams;
}

/**
 * Analisa conformidade entre pedidos e resultados
 */
export function analyzeCompliance(requestedExams: string[], resultExams: string[]): {
  status: "complete" | "partial" | "pending";
  details: string;
  missingExams: string[];
  extraExams: string[];
} {
  const requestedLower = requestedExams.map(e => e.toLowerCase().trim());
  const resultLower = resultExams.map(e => e.toLowerCase().trim());
  
  const missingExams: string[] = [];
  const foundExams: string[] = [];
  
  // Verifica quais exames solicitados foram realizados
  for (let i = 0; i < requestedExams.length; i++) {
    const requested = requestedLower[i];
    const found = resultLower.some(result => 
      result.includes(requested) || requested.includes(result)
    );
    
    if (found) {
      foundExams.push(requestedExams[i]);
    } else {
      missingExams.push(requestedExams[i]);
    }
  }
  
  // Verifica exames extras (não solicitados mas realizados)
  const extraExams: string[] = [];
  for (let i = 0; i < resultExams.length; i++) {
    const result = resultLower[i];
    const wasRequested = requestedLower.some(requested => 
      result.includes(requested) || requested.includes(result)
    );
    
    if (!wasRequested) {
      extraExams.push(resultExams[i]);
    }
  }
  
  let status: "complete" | "partial" | "pending";
  let details: string;
  
  if (missingExams.length === 0 && foundExams.length === requestedExams.length) {
    status = "complete";
    details = `Todos os ${requestedExams.length} exames solicitados foram realizados.`;
  } else if (foundExams.length > 0) {
    status = "partial";
    details = `${foundExams.length} de ${requestedExams.length} exames foram realizados. ${missingExams.length} exames faltando.`;
  } else {
    status = "pending";
    details = "Nenhum dos exames solicitados foi encontrado nos resultados.";
  }
  
  if (extraExams.length > 0) {
    details += ` ${extraExams.length} exame(s) adicional(is) não solicitado(s) foi(ram) realizado(s).`;
  }
  
  return {
    status,
    details,
    missingExams,
    extraExams,
  };
}
