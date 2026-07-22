import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text and page count from a local PDF file.
 * @param {string} filePath - Absolute or relative path to the PDF file.
 * @returns {Promise<{text: string, pages: number}>} The extracted text and page count details.
 */
export const extractPdfData = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`PDF file not found at path: ${filePath}`);
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Instantiate PDFParse class with binary Uint8Array data and quiet verbosity
    const parser = new pdfParse.PDFParse({
      data: new Uint8Array(dataBuffer),
      verbosity: 0,
    });

    const result = await parser.getText();
    if (!result.text || !result.text.trim()) {
      throw new Error('No text content could be extracted from this PDF document (e.g. empty or scanned document)');
    }

    return {
      text: result.text,
      pages: result.total || 1,
    };
  } catch (err) {
    throw new Error(`PDF Text Extraction Failed: ${err.message}`);
  }
};
