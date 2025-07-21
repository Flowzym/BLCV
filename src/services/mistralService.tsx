@@ .. @@
 async function generateBisSuggestions(
-  tasksToTranslate: string[],
+  task: string,
   config: KIModelSettings,
   bisPrompt: string
-): Promise<Record<string, string[]>> {
-  // Placeholder implementation
-  return {};
+): Promise<string[]> {
+  const fullPrompt = `${bisPrompt}
+
+Übersetze die folgende Tätigkeit in 3-5 offizielle BIS-Kompetenzen:
+
+${task}
+
+Gib nur die BIS-Kompetenzen zurück, eine pro Zeile, ohne Aufzählungszeichen oder Nummerierung:`;
+
+  try {
+    const result = await generateText(fullPrompt, config);
+    
+    // Parse the result into individual suggestions
+    const suggestions = result
+      .split('\n')
+      .map(line => line.trim())
+      .filter(line => line.length > 0 && !line.startsWith('•') && !line.match(/^\d+\./))
+      .slice(0, 5); // Limit to 5 suggestions
+    
+    return suggestions;
+  } catch (error) {
+    console.error('Error generating BIS suggestions:', error);
+    return [];
+  }
 }