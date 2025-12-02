import { extractExamNamesFromText, analyzeCompliance } from './server/pdfProcessor';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function extractText(pdfPath: string): Promise<string> {
  const tempTxtPath = `/tmp/extracted-${Date.now()}.txt`;
  await execAsync(`pdftotext "${pdfPath}" "${tempTxtPath}"`);
  const text = await fs.readFile(tempTxtPath, 'utf-8');
  await fs.unlink(tempTxtPath).catch(() => {});
  return text;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  TESTE COM LÓGICA REAL DO SERVIDOR                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  // Processar Pedido
  console.log('📋 Processando Pedido...');
  const pedidoText = await extractText('/home/ubuntu/upload/pedido.pdf');
  const requestedExams = extractExamNamesFromText(pedidoText);
  console.log(`✓ Exames solicitados: ${requestedExams.length}`);
  requestedExams.forEach((exam, i) => console.log(`  ${i + 1}. ${exam}`));
  
  // Processar Resultado
  console.log('\n🧪 Processando Resultado...');
  const resultadoText = await extractText('/home/ubuntu/upload/Resultado_camilla_amaral_siqueira_haase_20nov20251-AlinyFernandes.pdf');
  const performedExams = extractExamNamesFromText(resultadoText);
  console.log(`✓ Exames realizados: ${performedExams.length}`);
  performedExams.forEach((exam, i) => console.log(`  ${i + 1}. ${exam}`));
  
  // Análise
  console.log('\n📊 Análise de Conformidade...');
  const compliance = analyzeCompliance(requestedExams, performedExams);
  console.log(`Status: ${compliance.complianceStatus.toUpperCase()}`);
  console.log(`✓ Realizados: ${compliance.matchedExams.length}`);
  console.log(`⚠ Faltantes: ${compliance.missingExams.length}`);
  console.log(`ℹ Extras: ${compliance.extraExams.length}`);
  
  if (compliance.missingExams.length > 0) {
    console.log('\n⚠️  EXAMES FALTANTES:');
    compliance.missingExams.forEach((exam, i) => console.log(`  ${i + 1}. ${exam}`));
  }
}

main().catch(console.error);
