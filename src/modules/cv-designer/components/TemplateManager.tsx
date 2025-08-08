import React, { useEffect, useState } from "react";
import { listTemplates, saveTemplate, updateTemplate, deleteTemplate, exportTemplates, importTemplates } from "../services/templateRegistry";

export const TemplateManager: React.FC = () => {
  const [items, setItems] = useState(() => listTemplates());
  const [name, setName] = useState("");

  useEffect(() => {
    setItems(listTemplates());
  }, []);

  const handleAdd = () => {
    if (!name.trim()) return;
    saveTemplate({ name, data: {} });
    setName("");
    setItems(listTemplates());
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setItems(listTemplates());
  };

  const handleExport = () => {
    const blob = exportTemplates();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "templates.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await importTemplates(f);
    setItems(listTemplates());
  };

  return (
    <div className="space-y-3">
      <div className="font-semibold">Template-Manager (lokal)</div>
      <div className="flex gap-2">
        <input className="border px-2 py-1 rounded" placeholder="Neuer Template-Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <button className="px-2 py-1 border rounded" onClick={handleAdd}>Hinzufügen</button>
        <button className="px-2 py-1 border rounded" onClick={handleExport}>Export</button>
        <label className="px-2 py-1 border rounded cursor-pointer">
          Import
          <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </label>
      </div>
      <ul className="divide-y rounded border bg-white">
        {items.map((t)=>(
          <li key={t.id} className="p-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">v{t.version} · {t.updatedAt}</div>
            </div>
            <div className="flex gap-2">
              <button className="text-red-600 text-sm" onClick={()=>handleDelete(t.id)}>Löschen</button>
            </div>
          </li>
        ))}
        {items.length===0 && <li className="p-3 text-sm text-gray-500">Keine Templates gespeichert.</li>}
      </ul>
    </div>
  );
};
