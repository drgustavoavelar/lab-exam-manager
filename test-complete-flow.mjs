import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Simula extração de texto dos PDFs
async function extractText(pdfPath) {
  const tempTxtPath = `/tmp/extracted-${Date.now()}.txt`;
  await execAsync(`pdftotext "${pdfPath}" "${tempTxtPath}"`);
  const text = await fs.readFile(tempTxtPath, 'utf-8');
  await fs.unlink(tempTxtPath).catch(() => {});
  return text;
}

// Função simplificada de extração de nomes de exames
function extractExamNames(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2 && line.length < 200);
  
  const examKeywords = [
    'tsh', 't4', 't3', 'fsh', 'lh', 'estradiol', 'progesterona', 'prolactina',
    'testosterona', 'shbg', 'vitamina', 'hemograma', 'glicose', 'glicemia',
    'colesterol', 'triglicérides', 'triglicerídeos', 'hdl', 'ldl', 'vldl',
    'creatinina', 'ureia', 'uréia', 'tgo', 'tgp', 'ggt', 'fosfatase',
    'proteína', 'albumina', 'cálcio', 'calcio', 'pth', 'ferro', 'ferritina',
    'transferrina', 'ácido', 'acido', 'fólico', 'folico', 'homocisteína',
    'homocisteina', 'apolipoproteína', 'apolipoproteina', 'homa', 'insulina',
    'hba1c', 'eas', 'pcr'
  ];
  
  const exams = [];
  const seenExams = new Set();
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const hasKeyword = examKeywords.some(keyword => lineLower.includes(keyword));
    
    if (hasKeyword) {
      const examName = line
        .replace(/^\d+[\.\)]\s*/, '')
        .replace(/^[-•]\s*/, '')
        .trim();
      
      const examKey = examName.toLowerCase();
      if (examName && !seenExams.has(examKey) && examName.length > 3) {
        seenExams.add(examKey);
        exams.push(examName);
      }
    }
  }
  
  return exams;
}

// Função de análise de conformidade
function analyzeCompliance(requestedExams, performedExams) {
  const requestedSet = new Set(requestedExams.map(e => e.toLowerCase().trim()));
  const performedSet = new Set(performedExams.map(e => e.toLowerCase().trim()));
  
  const missingExams = [];
  const matchedExams = [];
  
  for (const requested of requestedExams) {
    const requestedLower = requested.toLowerCase().trim();
    let found = false;
    
    if (performedSet.has(requestedLower)) {
      matchedExams.push(requested);
      found = true;
    } else {
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
  
  const extraExams = [];
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
  
  let complianceStatus;
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

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  TESTE COMPLETO - Compatibilidade de Exames                  ║');
  console.log('║  Instituto Elo de Saúde                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  // PASSO 1: Processar Pedido
  console.log('📋 PASSO 1: Processando Pedido de Exames...');
  const pedidoPath = '/home/ubuntu/upload/pedido.pdf';
  const pedidoText = await extractText(pedidoPath);
  const requestedExams = extractExamNames(pedidoText);
  
  console.log(`✓ Pedido processado`);
  console.log(`✓ Exames solicitados identificados: ${requestedExams.length}`);
  console.log('\nExames solicitados:');
  requestedExams.forEach((exam, i) => {
    console.log(`  ${i + 1}. ${exam}`);
  });
  
  // PASSO 2: Processar Resultado
  console.log('\n\n🧪 PASSO 2: Processando Resultado de Exames...');
  const resultadoPath = '/home/ubuntu/upload/Resultado_camilla_amaral_siqueira_haase_20nov20251-AlinyFernandes.pdf';
  const resultadoText = await extractText(resultadoPath);
  const performedExams = extractExamNames(resultadoText);
  
  console.log(`✓ Resultado processado`);
  console.log(`✓ Exames realizados identificados: ${performedExams.length}`);
  console.log('\nExames realizados:');
  performedExams.forEach((exam, i) => {
    console.log(`  ${i + 1}. ${exam}`);
  });
  
  // PASSO 3: Análise de Conformidade
  console.log('\n\n📊 PASSO 3: Análise de Conformidade...');
  const compliance = analyzeCompliance(requestedExams, performedExams);
  
  console.log(`\nStatus: ${compliance.complianceStatus.toUpperCase()}`);
  console.log(`\n✓ Exames realizados: ${compliance.matchedExams.length}`);
  console.log(`⚠ Exames faltantes: ${compliance.missingExams.length}`);
  console.log(`ℹ Exames extras: ${compliance.extraExams.length}`);
  
  if (compliance.missingExams.length > 0) {
    console.log('\n\n⚠️  EXAMES FALTANTES (Não Conformidade):');
    console.log('═══════════════════════════════════════════════════════════════');
    compliance.missingExams.forEach((exam, i) => {
      console.log(`  ${i + 1}. ${exam}`);
    });
  }
  
  if (compliance.extraExams.length > 0) {
    console.log('\n\nℹ️  EXAMES EXTRAS (Não solicitados):');
    console.log('═══════════════════════════════════════════════════════════════');
    compliance.extraExams.forEach((exam, i) => {
      console.log(`  ${i + 1}. ${exam}`);
    });
  }
  
  // PASSO 4: Gerar Relatório
  console.log('\n\n📄 PASSO 4: Gerando Relatório de Não Conformidade...');
  
  const report = `
RELATÓRIO DE CONFORMIDADE DE EXAMES LABORATORIAIS
Instituto Elo de Saúde

Paciente: Camilla Amaral Siqueira Haase
Data: ${new Date().toLocaleDateString('pt-BR')}

═══════════════════════════════════════════════════════════════

RESUMO DA ANÁLISE

Total de exames solicitados: ${requestedExams.length}
Total de exames realizados: ${performedExams.length}
Exames em conformidade: ${compliance.matchedExams.length}
Exames faltantes: ${compliance.missingExams.length}
Status: ${compliance.complianceStatus === 'complete' ? 'COMPLETO' : compliance.complianceStatus === 'partial' ? 'PARCIAL' : 'PENDENTE'}

═══════════════════════════════════════════════════════════════

EXAMES FALTANTES (NÃO REALIZADOS)

${compliance.missingExams.length > 0 ? compliance.missingExams.map((exam, i) => `${i + 1}. ${exam}`).join('\n') : 'Nenhum exame faltante.'}

═══════════════════════════════════════════════════════════════

Os exames listados acima foram solicitados pelo médico mas não
constam no resultado laboratorial fornecido.

Recomenda-se entrar em contato com o laboratório para verificar
a realização dos exames pendentes.

_______________________________________________________________
Instituto Elo de Saúde
Av. Transbrasiliana, 141, Centro - Uruaçu/GO
Fone: (62) 99684-9889
`;
  
  await fs.writeFile('/home/ubuntu/lab_exam_manager/relatorio-teste.txt', report);
  console.log('✓ Relatório gerado: relatorio-teste.txt');
  
  console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  ✓ TESTE CONCLUÍDO COM SUCESSO                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
