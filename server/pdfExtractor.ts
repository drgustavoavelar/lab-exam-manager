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
    // Download do PDF
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
    });
    
    await writeFile(tempPdfPath, Buffer.from(response.data));
    
    // Extrai texto usando pdftotext
    await execAsync(`pdftotext "${tempPdfPath}" "${tempTxtPath}"`);
    
    // Lê o texto extraído
    const { readFile } = await import('fs/promises');
    const text = await readFile(tempTxtPath, 'utf-8');
    
    // Limpa arquivos temporários
    await unlink(tempPdfPath).catch(() => {});
    await unlink(tempTxtPath).catch(() => {});
    
    return text;
  } catch (error) {
    // Limpa arquivos temporários em caso de erro
    await unlink(tempPdfPath).catch(() => {});
    await unlink(tempTxtPath).catch(() => {});
    
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao processar o PDF');
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
