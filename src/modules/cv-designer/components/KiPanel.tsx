import React from "react";
import { aiChat } from "@/services/aiService";

type LogItem = {
  id: string;
  ts: string;
  prompt: string;
  status: "ok" | "error";
  result?: string;
  error?: string;
};

export const KiPanel: React.FC = () => {
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [log, setLog] = React.useState<LogItem[]>([]);

  const pushLog = (item: Omit<LogItem, "id" | "ts">) => {
    const id = Math.random().toString(36).slice(2);
    const ts = new Date().toISOString();
    setLog((prev) => [ { id, ts, ...item }, ...prev ].slice(0, 10));
  };

  const send = async () => {
    if (!input.trim()) return;
    setBusy(true);
    try {
      const res = await aiChat({ prompt: input });
      pushLog({ prompt: input.slice(0, 80), status: "ok", result: String(res ?? "") });
    } catch (e: any) {
      // graceful degradation message is thrown by aiService
      pushLog({ prompt: input.slice(0, 80), status: "error", error: e?.message || "KI nicht konfiguriert" });
    } finally {
      setBusy(false);
      setInput("");
    }
  };

  const [applyOpen, setApplyOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(true);

  return (

      {!hasAIEnv && (
        <div className="mb-3 rounded border border-blue-300 bg-blue-50 p-2 text-sm text-blue-800">
          KI ist deaktiviert: Keine ENV-Keys gefunden. Lege <code>VITE_OPENAI_API_KEY</code> (oder Mistral/Anthropic) in deiner <code>.env</code> an.
        </div>
      )}

    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          placeholder="Prompt eingeben…"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <button
          disabled={!hasAIEnv} onClick={send}
          disabled={busy}
          className="border rounded px-3 py-1 text-sm"
        >{busy ? "Senden…" : "Senden"}</button>
      </div>

      <div>
        <button
          className="w-full text-left font-medium"
          disabled={!hasAIEnv} onClick={()=>setApplyOpen(!applyOpen)}
        >▶ Vorschläge anwenden</button>
        {applyOpen && (
          <div className="mt-2 p-2 border rounded text-sm text-gray-600">
            Auswahl & Anwendung von KI‑Vorschlägen ist vorbereitet (no‑op im MVP).
          </div>
        )}
      </div>

      <div>
        <button
          className="w-full text-left font-medium"
          disabled={!hasAIEnv} onClick={()=>setViewOpen(!viewOpen)}
        >▶ Nur anzeigen (Log)</button>
        {viewOpen && (
          <ul className="mt-2 space-y-2">
            {log.map(item=>(
              <li key={item.id} className="border rounded p-2">
                <div className="text-xs text-gray-500">{item.ts}</div>
                <div className="text-sm">Prompt: {item.prompt}</div>
                <div className={"text-xs mt-1 " + (item.status==="ok"?"text-green-600":"text-red-600")}>
                  {item.status==="ok" ? "Erfolg" : (item.error || "Fehler")}
                </div>
                {item.result && <pre className="mt-1 whitespace-pre-wrap text-xs">{item.result}</pre>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Hinweis: Falls keine KI‑ENV gesetzt ist, bleibt das Panel nutzbar und zeigt einen dezenten Hinweis sowie Fehlereinträge statt Exceptions.
      </div>
    </div>
  );
};


/* Guards to prevent network calls without ENV */
const handleGuard = (fn:any)=> (...args:any[])=>{ if (!hasAIEnv) return; return fn?.(...args); };
