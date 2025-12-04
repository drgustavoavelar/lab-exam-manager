import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { randomBytes } from 'crypto';
import axios from 'axios';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Extrai texto de um PDF usando pdftotext (disponível no sistema)
 */
export async function extractTextFromPdfUrl(pdfUrl: string): Promise<string> {
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `pdf-${randomBytes(8).toString('hex')}.pdf`);
  const tempTxtPath = path.join(tempDir, `pdf-${randomBytes(8).toString('hex')}.txt`);
  
  try {
    console.log(`[PDF Extractor] Iniciando extração de: ${pdfUrl}`);
    
    // Download do PDF
    console.log('[PDF Extractor] Fazendo download do PDF...');
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 segundos de timeout
    });
    
    console.log(`[PDF Extractor] PDF baixado: ${response.data.byteLength} bytes`);
    await writeFile(tempPdfPath, Buffer.from(response.data));
    
    // Extrai texto usando pdftotext
    console.log('[PDF Extractor] Executando pdftotext...');
    const { stdout, stderr } = await execAsync(`pdftotext "${tempPdfPath}" "${tempTxtPath}"`);
    if (stderr) {
      console.warn('[PDF Extractor] pdftotext stderr:', stderr);
    }
    
    // Lê o texto extraído
    const { readFile } = await import('fs/promises');
    const text = await readFile(tempTxtPath, 'utf-8');
    console.log(`[PDF Extractor] Texto extraído: ${text.length} caracteres`);
    
    // Limpa arquivos temporários
    await unlink(tempPdfPath).catch(() => {});
    await unlink(tempTxtPath).catch(() => {});
    
    if (!text || text.trim().length === 0) {
      throw new Error('PDF não contém texto extraível (pode ser imagem)');
    }
    
    return text;
  } catch (error: any) {
    // Limpa arquivos temporários em caso de erro
    await unlink(tempPdfPath).catch(() => {});
    await unlink(tempTxtPath).catch(() => {});
    
    console.error('[PDF Extractor] Erro detalhado:', error);
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Timeout ao baixar o PDF. Tente novamente.');
    }
    
    if (error.response) {
      throw new Error(`Erro ao baixar PDF: ${error.response.status} ${error.response.statusText}`);
    }
    
    if (error.message.includes('texto extraível')) {
      throw new Error(error.message);
    }
    
    throw new Error('Falha ao processar o PDF. Por favor, cole o texto manualmente.');
  }
}

/**
 * Extrai texto de uma imagem usando OCR (futuramente)
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  // Por enquanto, retorna string vazia
  // Futuramente: implementar OCR com Tesseract ou serviço externo
  console.log('Extração de texto de imagem ainda não implementada:', imageUrl);
  return '';
}
