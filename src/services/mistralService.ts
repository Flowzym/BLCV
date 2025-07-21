import { KIModelSettings } from "../types/KIModelSettings";

async function callMistral(
  payload: Record<string, unknown>,
  config: KIModelSettings
) {
  if (!config.api_key || !config.api_key.startsWith("sk-")) {
    throw new Error(
      "Fehlender oder ungültiger API-Key. Bitte in den Einstellungen prüfen."
    );
  }

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.warn("Fehler-Antwort:", res.status, text);
      throw new Error(`KI-Antwort fehlgeschlagen (${res.status})`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    console.error("API-Aufruffehler:", err);
    throw new Error("Verbindung zur KI fehlgeschlagen.");
  }
}

async function generateText(prompt: string, config: KIModelSettings) {
  const body = {
    model: config.model,
    temperature: config.temperature,
    top_p: config.top_p,
    max_tokens: config.max_tokens,
    messages: [{ role: "user", content: prompt }],
  };

  return callMistral(body, config);
}

async function generateCoverLetter({
  cvContent,
  jobDescription,
  basePrompt,
  styles,
  stylePrompts,
  config,
}: {
  cvContent: string;
  jobDescription: string;
  basePrompt: string;
  styles: string[];
  stylePrompts: Record<string, string>;
  config: KIModelSettings;
}) {
  const styleText = styles
    .map((s) => stylePrompts[s])
    .filter(Boolean)
    .join(", ");

  const systemPrompt =
    styleText.length > 0
      ? `${basePrompt} Schreibe im ${styleText}.`
      : basePrompt;

  const input = `${cvContent}\n\n${jobDescription}`;

  const body = {
    model: config.model,
    temperature: config.temperature,
    top_p: config.top_p,
    max_tokens: config.max_tokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
  };

  return callMistral(body, config);
}

async function editCoverLetter(
  originalText: string,
  edits: string,
  config: KIModelSettings,
) {
  const body = {
    model: config.model,
    temperature: config.temperature,
    top_p: config.top_p,
    max_tokens: config.max_tokens,
    messages: [
      { role: "system", content: edits },
      { role: "user", content: originalText },
    ],
  };

  return callMistral(body, config);
}

async function generateBisSuggestions(
  tasksToTranslate: string[],
  config: KIModelSettings,
  bisPrompt: string
): Promise<Record<string, string[]>> {
  // Placeholder implementation
  return {};
}

export { generateText, editCoverLetter, generateCoverLetter, generateBisSuggestions };