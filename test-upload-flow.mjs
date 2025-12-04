import { readFile } from 'fs/promises';
import { storagePut } from './server/storage.ts';
import { extractTextFromPdfUrl } from './server/pdfExtractor.ts';

async function testUploadFlow() {
  try {
    console.log('=== Teste de Upload e Extração de PDF ===\n');
    
    // 1. Ler arquivo local
    console.log('1. Lendo arquivo silvia.pdf...');
    const pdfBuffer = await readFile('/home/ubuntu/upload/silvia.pdf');
    console.log(`   ✓ Arquivo lido: ${pdfBuffer.length} bytes\n`);
    
    // 2. Upload para S3
    console.log('2. Fazendo upload para S3...');
    const fileKey = `test-uploads/${Date.now()}-pedido.pdf`;
    const result = await storagePut(fileKey, pdfBuffer, 'application/pdf');
    console.log(`   ✓ Upload concluído`);
    console.log(`   URL: ${result.url}\n`);
    
    // 3. Extrair texto do PDF usando a URL do S3
    console.log('3. Extraindo texto do PDF...');
    const text = await extractTextFromPdfUrl(result.url);
    console.log(`   ✓ Texto extraído: ${text.length} caracteres`);
    console.log(`   Primeiros 200 caracteres:\n   ${text.substring(0, 200).replace(/\n/g, ' ')}\n`);
    
    console.log('=== Teste concluído com sucesso! ===');
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Detalhes:', error);
  }
}

testUploadFlow();
