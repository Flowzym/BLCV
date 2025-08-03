// 📄 src/modules/cv-designer/components/LayoutDesigner.tsx
import React, { useState, useEffect } from "react";
import { LayoutElement } from "../../types/section";
import { InlineSectionEditor } from "./InlineSectionEditor";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

interface LayoutDesignerProps {
  initialLayout: LayoutElement[];
  onLayoutChange: (layout: LayoutElement[]) => void;
}

export const LayoutDesigner: React.FC<LayoutDesignerProps> = ({ initialLayout, onLayoutChange }) => {
  const [layout, setLayout] = useState<LayoutElement[]>(initialLayout);
  useEffect(() => setLayout(initialLayout), [initialLayout]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 }}),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) return;
    const oldIndex = layout.findIndex((l) => l.id === active.id);
    const newIndex = layout.findIndex((l) => l.id === over.id);
    const newLayout = arrayMove(layout, oldIndex, newIndex);
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const updateSection = (id: string, patch: Partial<LayoutElement>) => {
    const newLayout = layout.map((section) => (section.id === id ? { ...section, ...patch } : section));
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={layout.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {layout.map((section) => (
            <InlineSectionEditor key={section.id} section={section} onChange={updateSection} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
