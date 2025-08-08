import React from "react";
import { exportDocument, ExportHooks } from "@/services/exportService";
import { useDocumentStore } from "@/store/DocumentStore";

import { useDesignerStore } from '../store/designerStore';

const ExportPanel: React.FC = () => {
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

      {/* Preflight */}
      <PreflightPanel />

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


function PreflightPanel(){
  const overflowIds = (useDesignerStore as any)((s:any)=> s.overflowIds ?? []);
  const marginWarnIds = (useDesignerStore as any)((s:any)=> s.marginWarnIds ?? []);
  const pxPerMm = 72/25.4;
  const exportMargin = (useDesignerStore as any)((s:any)=> s.exportMargin ?? 28.35);
  const mm = Math.round((exportMargin/pxPerMm)*10)/10;

  return (
    <div className="text-sm">
      <div className="mb-2 flex items-center gap-3">
        <label className="inline-flex items-center gap-2">
          <span className="text-gray-700">Rand (mm)</span>
          <input
            type="number" min={0} max={30} step={0.5}
            className="w-20 rounded border px-2 py-1"
            defaultValue={mm}
            onChange={(e)=>{
              const val = parseFloat((e.target as HTMLInputElement).value);
              const px = isNaN(val) ? 28.35 : val * pxPerMm;
              (useDesignerStore as any).getState().setExportMargin?.(px);
            }}
          />
        </label>
      </div>

      {overflowIds.length === 0 && marginWarnIds.length === 0 ? (
        <div className="text-green-700">Keine Warnungen. Alles bereit für den Export.</div>
      ) : (
        <div className="space-y-2">
          {overflowIds.length > 0 && (
            <div className="text-amber-800">
              <div className="font-medium">Überlauf außerhalb A4 ({overflowIds.length})</div>
              <ul className="list-disc pl-5">
                {overflowIds.map((id:string)=> (
                  <li key={id} className="flex items-center justify-between">
                    <span>{id}</span>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={()=> window.dispatchEvent(new CustomEvent('designer:focus-element', { detail: { id } }))}
                    >
                      zum Element
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {marginWarnIds.length > 0 && (
            <div className="text-amber-800">
              <div className="font-medium">Dicht am Seitenrand (&lt;= {Math.round(mm*10)/10} mm) – {marginWarnIds.length}</div>
              <ul className="list-disc pl-5">
                {marginWarnIds.map((id:string)=> (
                  <li key={id} className="flex items-center justify-between">
                    <span>{id}</span>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={()=> window.dispatchEvent(new CustomEvent('designer:focus-element', { detail: { id } }))}
                    >
                      zum Element
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
