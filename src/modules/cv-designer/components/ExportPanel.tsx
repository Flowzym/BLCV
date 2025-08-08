import React from "react";
import { exportDocument, ExportHooks } from "@/services/exportService";
import { useDocumentStore } from "@/store/DocumentStore";

export const ExportPanel: React.FC = () => {
  const sections = useDocumentStore(s=>s.cvSections);
  const style = useDocumentStore(s=>s.styleConfig);

  const [progress, setProgress] = React.useState<number>(0);
  const [status, setStatus] = React.useState<"idle"|"running"|"ok"|"error">("idle");
  const [error, setError] = React.useState<string|undefined>();
  const [lastType, setLastType] = React.useState<"pdf"|"docx"|"">("");

  const hooks: ExportHooks = {
    onStart(){ setStatus("running"); setProgress(5); setError(undefined); },
    onProgress(p){ setProgress(p); },
    onSuccess(){ setStatus("ok"); setProgress(100); },
    onError(err){ setStatus("error"); setError(err?.message || String(err)); }
  };

  const run = async (type:"pdf"|"docx") => {
    setLastType(type);
    await exportDocument("designer", type, { sections, style }, hooks);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="border rounded px-3 py-1 text-sm" onClick={()=>run("pdf")}>Export PDF</button>
        <button className="border rounded px-3 py-1 text-sm" onClick={()=>run("docx")}>Export DOCX</button>
      </div>

      <div className="text-sm">
        Status: {status==="idle" && "Bereit"}
                {status==="running" && `Rendern… ${progress}%`}
                {status==="ok" && `Erfolgreich (${lastType.toUpperCase()})`}
                {status==="error" && "Fehlgeschlagen"}
      </div>

      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div className="h-full bg-gray-600" style={{ width: `${progress}%` }} />
      </div>

      {status==="error" && (
        <details className="text-xs text-red-700">
          <summary>Details</summary>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </details>
      )}
    </div>
  );
};
