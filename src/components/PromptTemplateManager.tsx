import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { PromptState, PromptConfig } from '../types/Prompt';

interface PromptTemplateManagerProps {
  prompts: PromptState;
  onChange: (prompts: PromptState) => void;
}

export default function PromptTemplateManager({
  prompts,
  onChange,
}: PromptTemplateManagerProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{
    cat: keyof PromptState;
    key: string;
  } | null>(null);
  const [temp, setTemp] = useState<PromptConfig | null>(null);

  const CATS: { cat: keyof PromptState; title: string }[] = [
    { cat: 'documents', title: 'Dokumenttypen' },
    { cat: 'styles', title: 'Stil-Prompts' },
    { cat: 'edits', title: 'Edit-Prompts' },
  ];

  const handleAdd = (cat: keyof PromptState) => {
    const key = `prompt_${Date.now()}`;
    const newEntry: PromptConfig =
      cat === 'documents'
        ? { label: '', prompt: '', title: '', role: '', style: '', examples: '' }
        : { label: '', prompt: '' };
    onChange({
      ...prompts,
      [cat]: { ...prompts[cat], [key]: newEntry },
    });
    setEditing({ cat, key });
    setTemp(newEntry);
  };

  const handleDelete = (cat: keyof PromptState, key: string) => {
    const rest = { ...prompts[cat] };
    delete rest[key];
    onChange({ ...prompts, [cat]: rest });
  };

  const startEdit = (cat: keyof PromptState, key: string) => {
    setEditing({ cat, key });
    setTemp({ ...prompts[cat][key] });
  };

  const cancelEdit = () => {
    setEditing(null);
    setTemp(null);
  };

  const saveEdit = () => {
    if (!editing || !temp) return;
    onChange({
      ...prompts,
      [editing.cat]: {
        ...prompts[editing.cat],
        [editing.key]: temp,
      },
    });
    cancelEdit();
  };

  const renderFields = (cat: keyof PromptState) => (
    <>
      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Label</span>
        <input
          type="text"
          value={temp?.label || ''}
          onChange={(e) =>
            setTemp((p) => ({ ...(p as PromptConfig), label: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm font-medium text-gray-700">Prompt</span>
        <textarea
          value={temp?.prompt || ''}
          onChange={(e) =>
            setTemp((p) => ({ ...(p as PromptConfig), prompt: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
        />
      </label>
      {cat === 'documents' && (
        <>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Titel</span>
            <input
              type="text"
              value={temp?.title || ''}
              onChange={(e) =>
                setTemp((p) => ({ ...(p as PromptConfig), title: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Rolle</span>
            <input
              type="text"
              value={temp?.role || ''}
              onChange={(e) =>
                setTemp((p) => ({ ...(p as PromptConfig), role: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-gray-700">Stil</span>
            <input
              type="text"
              value={temp?.style || ''}
              onChange={(e) =>
                setTemp((p) => ({ ...(p as PromptConfig), style: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Beispiele</span>
            <textarea
              value={temp?.examples || ''}
              onChange={(e) =>
                setTemp((p) => ({ ...(p as PromptConfig), examples: e.target.value }))
              }
              rows={2}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties }
            />
          </label>
        </>
      )}
    </>
  );

  const filterEntries = ([, p]: [string, PromptConfig]) => {
    return p.label.toLowerCase().includes(search.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Suchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none"
        style={{ borderColor: '#F29400' }}
      />
      {CATS.map(({ cat, title }) => (
        <details key={cat} className="border rounded-md">
          <summary className="cursor-pointer px-3 py-2 bg-gray-100 flex justify-between items-center">
            <span>{title}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAdd(cat);
              }}
              className="flex items-center text-sm text-white px-2 py-1 rounded"
              style={{ backgroundColor: '#F29400' }}
            >
              <Plus className="h-4 w-4" /> Neu
            </button>
          </summary>
          <ul className="p-3 space-y-2">
            {Object.entries(prompts[cat])
              .filter(filterEntries)
              .map(([key, p]) => (
                <li key={key} className="border rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{p.label || key}</span>
                    <div className="space-x-1">
                      <button
                        onClick={() => startEdit(cat, key)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat, key)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {editing?.cat === cat && editing.key === key && temp && (
                    <div className="mt-2 space-y-2">
                      {renderFields(cat)}
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={saveEdit}
                          className="flex items-center space-x-1 text-white px-3 py-1 rounded"
                          style={{ backgroundColor: '#F29400' }}
                        >
                          <Save className="h-4 w-4" /> <span>Speichern</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center space-x-1 px-3 py-1 border rounded text-gray-600"
                        >
                          <X className="h-4 w-4" /> <span>Abbrechen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            {Object.keys(prompts[cat]).length === 0 && (
              <li className="text-sm text-gray-500">Keine Einträge</li>
            )}
          </ul>
        </details>
      ))}
    </div>
  );
}
