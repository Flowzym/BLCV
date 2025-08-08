// src/modules/cv-designer/components/KiPanel.tsx
import React from "react";

const hasAIEnv =
  !!(import.meta as any).env?.VITE_OPENAI_API_KEY ||
  !!(import.meta as any).env?.VITE_MISTRAL_API_KEY ||
  !!(import.meta as any).env?.VITE_ANTHROPIC_API_KEY;

type Props = {
  className?: string;
};

export default function KiPanel({ className }: Props) {
  return (
    <div className={className ?? ""}>
      {!hasAIEnv && (
        <div className="mb-3 rounded border border-blue-300 bg-blue-50 p-2 text-sm text-blue-800">
          KI ist deaktiviert: Keine ENV-Keys gefunden. Lege <code>VITE_OPENAI_API_KEY</code> (oder Mistral/Anthropic) in deiner <code>.env</code> an.
        </div>
      )}

      <div className="space-y-2">
        <button
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          disabled={!hasAIEnv}
          onClick={() => {
            if (!hasAIEnv) return;
            console.log("[KiPanel] Vorschläge generieren");
          }}
        >
          Vorschläge generieren
        </button>
      </div>
    </div>
  );
}
