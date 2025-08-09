/**
 * Minimaler DOCX-Stub: erzeugt einen Blob mit kurzer Info.
 * Ziel: kein Build-/Runtime-Crash, bis der echte DOCX-Export folgt (P3).
 */
export async function exportDocx(elements: any[] = [], tokens: any = {}): Promise<Blob> {
  const text =
`DOCX-Export noch nicht implementiert.
Elements: ${elements.length}
Hinweis: P3 führt echten DOCX-Export (docx oder pizzip/docxtemplater) ein.`;
  return new Blob([text], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}
