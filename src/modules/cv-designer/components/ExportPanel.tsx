import React from "react";

export default function ExportPanel() {
  // Platzhalter – hier hängen wir später exportPdf/exportDocx an.
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="font-semibold mb-2">Export</div>
      <button className="px-3 py-1 border rounded opacity-60 cursor-not-allowed" title="Kommt gleich">
        PDF
      </button>
      <button className="ml-2 px-3 py-1 border rounded opacity-60 cursor-not-allowed" title="Kommt gleich">
        DOCX
      </button>
      <p className="text-gray-500">Export wird als nächstes verdrahtet.</p>
    </div>
  );
}

export { ExportPanel }; // falls irgendwo als Named-Export importiert wird
