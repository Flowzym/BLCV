// 📄 src/modules/cv-designer/components/InlineSectionEditor.tsx
import React, { useState } from "react";
import { LayoutElement } from "../../types/section";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  section: LayoutElement;
  onChange: (id: string, patch: Partial<LayoutElement>) => void;
}

export const InlineSectionEditor: React.FC<Props> = ({ section, onChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [localTitle, setLocalTitle] = useState(section.title ?? "");
  const [localContent, setLocalContent] = useState(section.content ?? "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-md p-3 bg-white shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <input
          className="flex-1 font-semibold text-gray-800 outline-none bg-transparent"
          value={localTitle}
          onChange={(e) => {
            setLocalTitle(e.target.value);
            onChange(section.id, { title: e.target.value });
          }}
          placeholder="Titel"
        />
        <button onClick={() => onChange(section.id, { _delete: true } as any)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      <textarea
        className="w-full resize-none text-sm text-gray-700 outline-none bg-transparent"
        rows={3}
        value={localContent}
        onChange={(e) => {
          setLocalContent(e.target.value);
          onChange(section.id, { content: e.target.value });
        }}
        placeholder="Inhalt"
      />
    </div>
  );
};
