<script setup>
import { ref } from 'vue';
import LebenslaufPlaceholder from '@/components/LebenslaufPlaceholder.vue';

// Beispiel: aktive Registerkarte ("bewerbung" oder "lebenslauf")
const activeTab = ref('bewerbung');
</script>

<template>
  <div>
    <div class="mb-4 space-x-2">
      <button @click="activeTab = 'bewerbung'" class="px-4 py-2 bg-gray-200 rounded">Bewerbung</button>
      <button @click="activeTab = 'lebenslauf'" class="px-4 py-2 bg-gray-200 rounded">Lebenslauf</button>
    </div>

    <div v-if="activeTab === 'lebenslauf'">
      <LebenslaufPlaceholder />
    </div>
  </div>
</template>
