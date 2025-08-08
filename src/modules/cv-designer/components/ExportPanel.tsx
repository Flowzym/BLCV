// src/modules/cv-designer/components/ExportPanel.tsx
import React, { useState } from "react";
import { useDesignerStore } from "../store/designerStore";

async function exportPdfSafe() {
  try {
    const svc = await import("../services/exportPdf");
    if (typeof svc.exportPdf === "function") {
      const st: any = (useDesignerStore as any).getState();
      return svc.exportPdf(st.elements, st.tokens);
    }
  } catch (e) {
    console.warn("[ExportPanel] exportPdf not available:", e);
  }
  return null;
}

async function exportDocxSafe() {
  try {
    const svc = await import("../services/exportDocx");
    if (typeof svc.exportDocx === "function") {
      const st: any = (useDesignerStore as any).getState();
      return svc.exportDocx(st.elements, st.tokens);
    }
  } catch (e) {
    console.warn("[ExportPanel] exportDocx not available:", e);
  }
  return null;
}

type Props = { className?: string };

export function ExportPanel({ className }: Props) {
  const elements = useDesignerStore((s) => s.elements);
  const margins = useDesignerStore((s) => s.exportMargins);
  const overflow = useDesignerStore((s) => s.overflowIds);
  const near = useDesignerStore((s) => s.marginWarnIds);
  const [busy, setBusy] = useState<null | "pdf" | "docx">(null);

  const disabled = busy !== null;

  return (
    <div className={className ?? ""}>
      <div className="mb-2 text-sm text-gray-700">
        <div>Elemente: <b>{elements.length}</b></div>
        <div>Seitenränder: <b>{Math.round(margins.left)} / {Math.round(margins.top)} / {Math.round(margins.right)} / {Math.round(margins.bottom)} px</b></div>
        {(overflow.length > 0 || near.length > 0) && (
          <div className="mt-1 text-xs">
            {overflow.length > 0 && <div className="text-red-600">Überlauf: {overflow.length}</div>}
            {near.length > 0 && <div className="text-amber-600">Nahe Rand: {near.length}</div>}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          disabled={disabled}
          onClick={async () => {
            setBusy("pdf");
            try {
              await exportPdfSafe();
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "pdf" ? "Exportiere PDF…" : "Export als PDF"}
        </button>

        <button
          className="rounded bg-gray-100 px-3 py-1.5 text-sm text-gray-800 ring-1 ring-gray-300 disabled:opacity-50"
          disabled={disabled}
          onClick={async () => {
            setBusy("docx");
            try {
              await exportDocxSafe();
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "docx" ? "Exportiere DOCX…" : "Export als DOCX"}
        </button>
      </div>
    </div>
  );
}

export default ExportPanel;
