// src/components/layout/TabNavigation.tsx
import React, { useEffect, useMemo, useState } from "react";

type TabItem = {
  id: string;
  label: string;
  badge?: number;
  disabled?: boolean;
};

type Props = {
  tabs: TabItem[];
  /** Controlled active tab id (if provided we won't manage state internally) */
  activeId?: string;
  /** Initial active id when uncontrolled */
  defaultActiveId?: string;
  onChange?(id: string): void;
};

export default function TabNavigation({ tabs, activeId, defaultActiveId, onChange }: Props) {
  const [internal, setInternal] = useState<string | null>(defaultActiveId ?? (tabs[0]?.id ?? null));

  const current = activeId ?? internal;
  useEffect(() => { if (activeId) setInternal(activeId); }, [activeId]);

  const visibleTabs = useMemo(() => tabs.filter(Boolean), [tabs]);

  return (
    <div role="tablist" className="flex gap-2 border-b">
      {visibleTabs.map((t) => {
        const isActive = current === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => { setInternal(t.id); onChange?.(t.id); }}
            disabled={t.disabled}
            className={`-mb-px border-b-2 px-3 py-1 text-sm ${isActive ? "border-gray-900 font-medium text-gray-900" : "border-transparent text-gray-600 hover:text-gray-900"}`}
          >
            <span>{t.label}</span>
            {typeof t.badge === "number" && t.badge > 0 && (
              <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs text-gray-700">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
