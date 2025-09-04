import React from 'react';
import LebenslaufEditor from '@/components/LebenslaufEditor';

export default function CVPlayground() {
  return (
    <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">CV Playground</h1>
        <p className="text-sm text-muted-foreground">End-to-end Oberfläche zum Testen von Eingabe, Sortierung, Export & Druck.</p>
      </div>
      <LebenslaufEditor />
    </main>
  );
}
