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

  console.log('DEBUG: callMistral function entered');
  console.log('DEBUG: API Call - Payload being sent:', JSON.stringify(payload, null, 2));
  console.log('DEBUG: API Call - Endpoint:', config.endpoint);
  console.log('DEBUG: API Call - Model:', config.model);
  console.log('DEBUG: API Call - API Key (first 10 chars):', config.api_key.substring(0, 10) + '...');

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log('DEBUG: API Call - Response status:', res.status);
    console.log('DEBUG: API Call - Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const text = await res.text();
      console.error("DEBUG: API Call - Error response status:", res.status);
      console.error("DEBUG: API Call - Error response text:", text);
      throw new Error(`KI-Antwort fehlgeschlagen (${res.status})`);
    }

    const data = await res.json();
    console.log('DEBUG: API Call - Full JSON response:', JSON.stringify(data, null, 2));
    console.log('DEBUG: API Call - Response data structure:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      firstChoiceStructure: data.choices?.[0] ? Object.keys(data.choices[0]) : 'No first choice',
      messageContent: data.choices?.[0]?.message?.content || 'No content found'
    });

    return data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    console.error("DEBUG: API Call - Fetch error:", err);
    console.error("DEBUG: API Call - Error details:", {
      name: err instanceof Error ? err.name : 'Unknown',
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : 'No stack trace'
    });
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