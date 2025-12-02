import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Erro ao processar ${pdfPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('=== Teste de Extração de PDFs ===\n');
  
  // Pedido
  console.log('1. Processando PEDIDO DE EXAMES...');
  const pedidoPath = '/home/ubuntu/upload/pedido.pdf';
  const pedidoText = await extractTextFromPDF(pedidoPath);
  if (pedidoText) {
    console.log(`✓ Pedido extraído: ${pedidoText.length} caracteres`);
    console.log('\nPrimeiras linhas do pedido:');
    console.log(pedidoText.substring(0, 500));
    console.log('\n---\n');
  }
  
  // Resultado
  console.log('2. Processando RESULTADO DE EXAMES...');
  const resultadoPath = '/home/ubuntu/upload/Resultado_camilla_amaral_siqueira_haase_20nov20251-AlinyFernandes.pdf';
  const resultadoText = await extractTextFromPDF(resultadoPath);
  if (resultadoText) {
    console.log(`✓ Resultado extraído: ${resultadoText.length} caracteres`);
    console.log('\nPrimeiras linhas do resultado:');
    console.log(resultadoText.substring(0, 500));
    console.log('\n---\n');
  }
  
  // Salvar textos extraídos para análise
  if (pedidoText) {
    fs.writeFileSync('/home/ubuntu/lab_exam_manager/pedido-extraido.txt', pedidoText);
    console.log('✓ Texto do pedido salvo em: pedido-extraido.txt');
  }
  
  if (resultadoText) {
    fs.writeFileSync('/home/ubuntu/lab_exam_manager/resultado-extraido.txt', resultadoText);
    console.log('✓ Texto do resultado salvo em: resultado-extraido.txt');
  }
  
  console.log('\n=== Teste Concluído ===');
}

main();
