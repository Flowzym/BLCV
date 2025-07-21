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
      const result = await generateText(fullPrompt, config);
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
        .slice(0, 5); // Limit to 5 suggestions
      
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
      console.error('DEBUG: Error generating BIS suggestions for task "' + task + '":', error);
    }
  }
  
  console.log('DEBUG: Final results from generateBisSuggestions:', results);
  return results;
}

export { generateBisSuggestions }