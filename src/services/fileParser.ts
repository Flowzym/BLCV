import mammoth from "mammoth";

export async function parseFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await file.text();
    }

    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // For PDF parsing, we'll implement a basic extraction
      // In a production app, you'd want to use a more robust PDF parser
      return "PDF-Parsing ist in dieser Demo-Version noch nicht vollständig implementiert. Bitte verwenden Sie Text oder DOCX-Dateien, oder geben Sie den Inhalt manuell ein.";
    }

    // Fallback: try to read as text
    return await file.text();
  } catch (error: unknown) {
    console.error("Error parsing file:", error);
    throw new Error(
      "Fehler beim Lesen der Datei. Bitte versuchen Sie es mit einer anderen Datei oder geben Sie den Inhalt manuell ein.",
    );
  }
}

export async function extractTextFromUrl(url: string): Promise<string> {
  void url; // placeholder to satisfy no-unused-vars until implemented
  // Due to browser CORS restrictions, direct URL fetching is not possible
  // in client-side applications. This would require a backend proxy service.
  throw new Error(
    "Das direkte Laden von URLs ist aufgrund von Browser-Sicherheitsrichtlinien (CORS) nicht möglich. " +
      'Bitte öffnen Sie die Webseite in einem neuen Tab, kopieren Sie den gewünschten Text und fügen Sie ihn über "Text eingeben" ein.',
  );
}
