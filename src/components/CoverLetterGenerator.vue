<template>
  <div class="w-full px-6 py-4 space-y-8">
    <!-- OBERER BEREICH: 3-SPALTEN-LAYOUT -->
    <div class="grid grid-cols-[260px_1fr_1fr] gap-6">
      <!-- Dokumenttyp -->
      <div>
        <h2 class="text-lg font-bold mb-2">📄 Dokument-Typ</h2>
        <DocumentTypeSelector />
      </div>

      <!-- Lebenslauf / Profil -->
      <div class="overflow-visible min-h-[400px]">
        <h2 class="text-lg font-bold mb-2">👤 Lebenslauf / Profil</h2>
        <ProfilTabs />
      </div>

      <!-- Stellenanzeige -->
      <div>
        <h2 class="text-lg font-bold mb-2">🏢 Stellenanzeige</h2>
        <JobAdInput />
      </div>
    </div>

    <!-- UNTERER BEREICH: PROMPT + GENERIERUNG + ERGEBNIS -->
    <div class="w-full space-y-4 border-t pt-6">
      <PromptEditor />

      <div class="flex justify-end">
        <GenerateButton />
      </div>

      <CoverLetterEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
// Placeholder script block for Vue 3 setup syntax.
// The actual component implementations need to be provided
// elsewhere in the application.
</script>

<style scoped>
/* Keine zusätzlichen Styles notwendig, Layout erfolgt mit TailwindCSS */
</style>
