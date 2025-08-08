import mammoth from "mammoth";
import pdfjsLib from "pdfjs-dist";
import { aiChat } from "@/services/aiService";
import { importCV } from "@/modules/cv-designer/services/importCV";

export const MAX_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_TYPES = ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Nicht unterstützter Dateityp');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Datei zu groß (max. 20MB)');
  }
}

try {
  // @ts-ignore
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs';
  }
} catch {}


export async function parseDocx(buffer:ArrayBuffer){
  const {value} = await mammoth.extractRawText({arrayBuffer:buffer});
  return value;
}

export async function parsePdf(buffer:ArrayBuffer){
  const data = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({data}).promise;
  let txt="";
  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    txt += content.items.map((it:any)=>it.str).join(" ")+"\n";
  }
  return txt;
}

export async function reverseUploadCv(file:File){
  validateFile(file);
  const buffer = await file.arrayBuffer();
  const raw = file.type==="application/pdf" ? await parsePdf(buffer) : await parseDocx(buffer);
  const json = await aiChat({prompt:"Convert CV text to JSON sections:"+raw});
  return importCV(JSON.parse(json));
}
