// src/modules/cv-designer/components/ExportPanel.tsx
import React, { useState } from "react";
import { useDesignerStore } from "../store/designerStore";

export default function ExportPanel() {
  const elements = useDesignerStore((s) => s.elements);
  const tokens = useDesignerStore((s) => s.tokens);
  const [busy, setBusy] = useState<string | null>(null);

  async function exportPdf() {
    setBusy("pdf");
    try {
      const { exportPdf } = await import("../services/exportPdf");
      const blob = await exportPdf(elements, tokens);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "designer.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function exportDocx() {
    setBusy("docx");
    try {
      const { exportLayoutDocx } = await import("../services/exportLayoutDocx");
      const blob = await exportLayoutDocx(elements, tokens);
      const url = URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      a.download = "designer.docx";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        onClick={exportPdf}
        disabled={busy !== null}
      >
        {busy === "pdf" ? "Exportiere PDF …" : "Export PDF"}
      </button>

      <button
        className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        onClick={exportDocx}
        disabled={busy !== null}
      >
        {busy === "docx" ? "Exportiere DOCX …" : "Export DOCX"}
      </button>
    </div>
  );
}
