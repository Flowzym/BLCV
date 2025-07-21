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
  console.log('DEBUG: generateBisSuggestions called with tasks:', tasksToTranslate);
  console.log('DEBUG: Using model:', config.model);
  console.log('DEBUG: BIS prompt length:', bisPrompt.length);
  
  const results: Record<string, string[]> = {};
  
  for (const task of tasksToTranslate) {
    console.log(`DEBUG: Processing individual task: "${task}"`);
    
    const fullPrompt = `${bisPrompt}

Übersetze die folgende Tätigkeit in 3-5 offizielle BIS-Kompetenzen:

${task}

Gib nur die BIS-Kompetenzen zurück, eine pro Zeile, ohne Aufzählungszeichen oder Nummerierung:`;

    console.log('DEBUG: Full prompt being sent to AI:', fullPrompt);

    try {
      console.log(`DEBUG: About to call generateText for task: "${task}"`);
      const result = await generateText(fullPrompt, config);
      console.log(`DEBUG: Result from generateText for task "${task}":`, result);
      console.log('DEBUG: Raw AI response for task "' + task + '":', JSON.stringify(result, null, 2));
      console.log('DEBUG: Raw AI response length:', result.length);
      console.log('DEBUG: Raw AI response first 200 chars:', result.substring(0, 200));
      
      // Parse the result into individual suggestions
      const suggestions = result
        .split('\n')
        .map(line => line.trim())
        .map(line => line.replace(/^•\s*/, '')) // Entfernt den Aufzählungspunkt-Präfix
        .map(line => line.replace(/^\d+\.\s*/, '')) // Entfernt den nummerierten Listen-Präfix
        .filter(line => line.length > 0) // Stellt sicher, dass die Zeile nach der Bearbeitung nicht leer ist
        .slice(0, 5); // Begrenzt auf maximal 5 Vorschläge
      
      console.log('DEBUG: Parsed suggestions for task "' + task + '":', JSON.stringify(suggestions, null, 2));
      console.log('DEBUG: Number of parsed suggestions:', suggestions.length);
      console.log('DEBUG: Individual suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`  [${index}]: "${suggestion}"`);
      });
      
      if (suggestions.length > 0) {
        results[task] = suggestions;
      }
    } catch (error) {
      console.error(`DEBUG: Error processing task "${task}":`, error);
      results[task] = [];
    }
  }
  
  return results;
}

export { generateText, editCoverLetter, generateCoverLetter, generateBisSuggestions };