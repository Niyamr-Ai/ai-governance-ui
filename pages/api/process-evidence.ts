import type { NextApiRequest, NextApiResponse } from "next";

// ⚠️ DEPRECATED: This endpoint has been moved to the backend Express server
// to avoid Turbopack bundling issues with native modules.
// The frontend now calls /api/process-evidence on the backend directly.
// This file is kept for reference but is no longer used.

// Use require() for native modules to avoid Turbopack bundling issues
// These are server-only packages that should not be bundled
const fs = require("fs");

// Lazy load native modules using require() to avoid Turbopack issues
function loadNativeModules() {
  const tesseract = require("tesseract.js");
  const pdfParse = require("pdf-parse");
  const canvas = require("canvas");
  const formidable = require("formidable");
  
  // Try different import paths for pdfjs-dist
  let pdfjsLib;
  try {
    pdfjsLib = require("pdfjs-dist/build/pdf.js");
  } catch (e) {
    try {
      pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    } catch (e2) {
      // Fallback to .mjs if available
      pdfjsLib = require("pdfjs-dist/build/pdf.mjs");
    }
  }
  
  // Configure pdfjs-dist for server-side use (disable worker)
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }
  
  return {
    createWorker: tesseract.createWorker,
    Worker: tesseract.Worker,
    pdfParse,
    pdfjsLib,
    createCanvas: canvas.createCanvas,
    formidable,
  };
}

/**
 * Process Evidence Files API
 * 
 * POST /api/process-evidence
 * 
 * Accepts FormData with files and extracts text content using OCR:
 * - PDF files (converted to images, then OCR)
 * - Image files (PNG, JPG, JPEG) - direct OCR
 * - TXT files (read directly)
 * 
 * Returns extracted text content for each file using OCR
 */

// Initialize Tesseract worker
let worker: any = null;
let modules: any = null;

async function getWorker(): Promise<any> {
  if (!modules) {
    modules = loadNativeModules();
  }
  if (!worker) {
    worker = await modules.createWorker('eng');
  }
  return worker;
}

async function cleanupWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

// Convert PDF pages to images and OCR them
async function ocrPdf(buffer: Buffer, fileName: string): Promise<string> {
  if (!modules) {
    modules = loadNativeModules();
  }
  
  console.log(`   📄 [OCR] File: ${fileName}`);
  console.log(`   📊 [OCR] File size: ${buffer.length} bytes`);
  
  try {
    // First, try to extract text directly from PDF (for text-based PDFs)
    console.log(`   🔍 [OCR] Step 1: Attempting direct text extraction (pdf-parse)...`);
    try {
      const pdfData = await modules.pdfParse(buffer);
      const textLength = pdfData.text ? pdfData.text.trim().length : 0;
      console.log(`   📄 [OCR] Text extraction result: ${textLength} characters from ${pdfData.numpages} page(s)`);
      
      if (pdfData.text && pdfData.text.trim().length > 50) {
        // If we got substantial text, return it (this is faster than OCR)
        console.log(`   ✅ [OCR] Using direct text extraction (${textLength} chars) - OCR not needed`);
        return pdfData.text;
      } else {
        console.log(`   ⚠️  [OCR] Limited text extracted (${textLength} chars) - switching to OCR for scanned PDF`);
      }
    } catch (parseError: any) {
      // If pdf-parse fails, continue with OCR approach
      console.log(`   ⚠️  [OCR] Direct text extraction failed - switching to OCR`);
    }
    
    // If text extraction didn't work or returned little text, try OCR for scanned PDFs
    console.log(`   🔍 [OCR] Step 2: Starting OCR processing (pdfjs-dist + Tesseract.js)...`);
    try {
      // Convert Buffer to Uint8Array as required by pdfjs-dist
      const uint8Array = new Uint8Array(buffer);
      console.log(`[PDF OCR] Converted buffer to Uint8Array: ${uint8Array.length} bytes`);
      
      // Load PDF document
      console.log(`[PDF OCR] Loading PDF document with pdfjs-dist...`);
      const loadingTask = modules.pdfjsLib.getDocument({ 
        data: uint8Array,
        useSystemFonts: true,
        verbosity: 0,
        isEvalSupported: false // Disable eval for security
      });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      console.log(`   ✅ [OCR] PDF loaded: ${numPages} page(s)`);
      
      console.log(`   🔧 [OCR] Initializing Tesseract.js OCR worker...`);
      const worker = await getWorker();
      console.log(`   ✅ [OCR] Tesseract.js worker ready`);
      
      let allText = "";
      let successfulPages = 0;
      
      // Process each page with OCR
      console.log(`   🔍 [OCR] Starting OCR extraction for ${numPages} page(s)...\n`);
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          console.log(`      📄 [OCR] Processing page ${pageNum}/${numPages}...`);
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          
          // Create canvas for rendering
          const canvas = modules.createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');
          
          // Render PDF page to canvas
          await page.render({
            canvasContext: context as any,
            viewport: viewport,
            canvas: canvas as any
          } as any).promise;
          
          // Convert canvas to image buffer
          const imageBuffer = canvas.toBuffer('image/png');
          console.log(`         📸 Rendered to image: ${imageBuffer.length} bytes`);
          
          // Perform OCR on the image
          console.log(`         🔍 Running Tesseract.js OCR...`);
          const { data: { text } } = await worker.recognize(imageBuffer);
          const pageTextLength = text ? text.trim().length : 0;
          console.log(`         ✅ OCR result: ${pageTextLength} characters extracted`);
          
          if (text && text.trim().length > 0) {
            allText += `\n\n--- Page ${pageNum} ---\n\n${text}`;
            successfulPages++;
          }
        } catch (pageError: any) {
          console.error(`         ❌ [OCR] Error processing page ${pageNum}: ${pageError.message}`);
          // Continue with next page
        }
      }
      
      console.log(`\n   ✅ [OCR] OCR extraction completed:`);
      console.log(`      Pages processed: ${successfulPages}/${numPages}`);
      console.log(`      Total text extracted: ${allText.length} characters`);
      return allText.trim();
    } catch (ocrError: any) {
      console.error(`[PDF OCR] OCR processing failed, using text extraction:`, ocrError);
      // Fallback to pdf-parse if OCR fails
      const pdfData = await modules.pdfParse(buffer);
      return pdfData.text || "";
    }
  } catch (error: any) {
    console.error(`[PDF OCR] ❌ Complete failure processing PDF ${fileName}:`, error.message);
    throw error;
  }
}

// OCR image files
async function ocrImage(buffer: Buffer, fileName: string): Promise<string> {
  console.log(`   🖼️  [OCR] Image file: ${fileName}`);
  console.log(`   📊 [OCR] File size: ${buffer.length} bytes`);
  console.log(`   🔧 [OCR] Initializing Tesseract.js OCR worker...`);
  try {
    const worker = await getWorker();
    console.log(`   ✅ [OCR] Tesseract.js worker ready`);
    console.log(`   🔍 [OCR] Running OCR extraction...`);
    const { data: { text } } = await worker.recognize(buffer);
    const textLength = text ? text.trim().length : 0;
    console.log(`   ✅ [OCR] OCR completed: ${textLength} characters extracted`);
    return text || "";
  } catch (error: any) {
    console.error(`   ❌ [OCR] OCR failed: ${error.message}`);
    throw error;
  }
}

// Read text files directly
function readTextFile(buffer: Buffer, fileName: string): string {
  console.log(`[Text File] Reading file: ${fileName}, size: ${buffer.length} bytes`);
  const text = buffer.toString('utf-8');
  const textLength = text ? text.trim().length : 0;
  console.log(`[Text File] ✅ Read ${textLength} characters from ${fileName}`);
  return text;
}

// Disable body parser to allow formidable to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ⚠️ DEPRECATED: Redirect to backend
  console.log(`⚠️  [DEPRECATED] /api/process-evidence called on Next.js - this endpoint has been moved to backend`);
  return res.status(410).json({ 
    error: 'This endpoint has been moved to the backend server',
    message: 'Please use the backend endpoint at http://localhost:3001/api/process-evidence'
  });
  
  // OLD CODE BELOW - NO LONGER EXECUTED
  /*
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📤 [EVIDENCE UPLOAD] ===== Evidence Upload Request Received =====`);
  console.log(`${'='.repeat(80)}\n`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load native modules first
    if (!modules) {
      console.log(`🔧 [EVIDENCE UPLOAD] Loading OCR modules (Tesseract.js, pdfjs-dist, canvas)...`);
      modules = loadNativeModules();
      console.log(`✅ [EVIDENCE UPLOAD] OCR modules loaded successfully\n`);
    }
    
    // Parse multipart/form-data using formidable
    const form = modules.formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const fileArray = Array.isArray(files.files) ? files.files : files.files ? [files.files] : [];
    
    console.log(`📁 [EVIDENCE UPLOAD] Processing ${fileArray.length} file(s) for OCR extraction\n`);
    
    if (fileArray.length === 0) {
      console.error(`❌ [EVIDENCE UPLOAD] No files in request`);
      return res.status(400).json({ error: 'No files provided' });
    }

    const results: Record<string, string> = {};

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const fileName = file.originalFilename || file.newFilename || 'unknown';
      const filePath = file.filepath;
      const mimeType = file.mimetype || '';
      
      console.log(`${'─'.repeat(80)}`);
      console.log(`📄 [EVIDENCE UPLOAD] File ${i + 1}/${fileArray.length}: ${fileName}`);
      console.log(`   Type: ${mimeType || 'unknown'}`);
      console.log(`   Size: ${file.size || 'unknown'} bytes`);
      console.log(`${'─'.repeat(80)}`);

      try {
        // Read file buffer
        const fileBuffer = fs.readFileSync(filePath);
        console.log(`📖 [EVIDENCE UPLOAD] File buffer read: ${fileBuffer.length} bytes`);

        let extractedText = "";
        let usedOCR = false;

        if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          console.log(`\n🔍 [OCR] PDF file detected - Starting OCR extraction process...`);
          console.log(`🔍 [OCR] Method: Tesseract.js OCR (via pdfjs-dist for page rendering)\n`);
          usedOCR = true;
          extractedText = await ocrPdf(fileBuffer, fileName);
        } else if (mimeType.startsWith('image/') || /\.(png|jpg|jpeg)$/i.test(fileName)) {
          console.log(`\n🔍 [OCR] Image file detected - Starting OCR extraction process...`);
          console.log(`🔍 [OCR] Method: Tesseract.js OCR (direct image processing)\n`);
          usedOCR = true;
          extractedText = await ocrImage(fileBuffer, fileName);
        } else if (mimeType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
          console.log(`\n📝 [TEXT] Text file detected - Reading directly (no OCR needed)\n`);
          extractedText = readTextFile(fileBuffer, fileName);
        } else {
          console.warn(`\n⚠️  [EVIDENCE UPLOAD] Unsupported file type: ${mimeType} for ${fileName}\n`);
          extractedText = `[Unsupported file type: ${mimeType}]`;
        }

        results[fileName] = extractedText;
        
        if (usedOCR) {
          console.log(`\n✅ [OCR] OCR extraction completed for ${fileName}`);
          console.log(`   Extracted text length: ${extractedText.length} characters`);
        } else {
          console.log(`\n✅ [EVIDENCE UPLOAD] File processed successfully: ${fileName}`);
          console.log(`   Content length: ${extractedText.length} characters`);
        }
        console.log(`${'─'.repeat(80)}\n`);
        
        // Clean up temporary file
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.warn(`⚠️  [EVIDENCE UPLOAD] Could not delete temp file ${filePath}`);
        }
      } catch (fileError: any) {
        console.error(`\n❌ [EVIDENCE UPLOAD] Error processing ${fileName}:`, fileError.message);
        console.error(`   Stack:`, fileError.stack);
        console.log(`${'─'.repeat(80)}\n`);
        results[fileName] = `[Error processing file: ${fileError.message}]`;
      }
    }

    console.log(`${'='.repeat(80)}`);
    console.log(`✅ [EVIDENCE UPLOAD] ===== All files processed successfully =====`);
    console.log(`   Total files: ${fileArray.length}`);
    console.log(`   Results: ${Object.keys(results).length} file(s) processed`);
    console.log(`${'='.repeat(80)}\n`);
    
    return res.status(200).json({ files: results });
  } catch (error: any) {
    console.error(`\n${'='.repeat(80)}`);
    console.error(`❌ [EVIDENCE UPLOAD] ===== Fatal Error =====`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error(`${'='.repeat(80)}\n`);
    return res.status(500).json({ error: 'Failed to process evidence files', message: error.message });
  } finally {
    // Cleanup worker
    await cleanupWorker();
  }
  */
}

