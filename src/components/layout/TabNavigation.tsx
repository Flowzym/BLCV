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
  onChange?: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Robust TabNavigation:
 * - Works controlled (via activeId) or uncontrolled (internal state)
 * - No reliance on external globals; avoids "activeId is not defined"
 * - Keyboard navigation: ArrowLeft/ArrowRight, Home/End
 * - A11y: role=tablist / role=tab
 */
export default function TabNavigation({
  tabs,
  activeId: controlledActive,
  defaultActiveId,
  onChange,
  className,
  size = "md",
}: Props) {
  const firstId = useMemo(() => tabs?.[0]?.id ?? "", [tabs]);
  const [internalActive, setInternalActive] = useState<string>(
    controlledActive ?? defaultActiveId ?? firstId
  );

  // Keep internal in sync when controlled value changes
  useEffect(() => {
    if (controlledActive !== undefined) {
      setInternalActive(controlledActive);
    }
  }, [controlledActive]);

  // If current active is missing (tabs changed), fall back to first
  useEffect(() => {
    const current = controlledActive ?? internalActive;
    if (!current || !tabs.some((t) => t.id === current)) {
      const next = tabs.find((t) => !t.disabled)?.id ?? firstId;
      if (controlledActive === undefined) {
        setInternalActive(next);
      }
      onChange?.(next);
    }
  }, [tabs, firstId]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentActive = controlledActive ?? internalActive;

  const handleClick = (id: string, disabled?: boolean) => {
    if (disabled) return;
    if (controlledActive === undefined) setInternalActive(id);
    onChange?.(id);
  };

  // keyboard nav
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const idx = tabs.findIndex((t) => t.id === currentActive);
    if (idx < 0) return;
    const prevIdx = (i: number) => (i - 1 + tabs.length) % tabs.length;
    const nextIdx = (i: number) => (i + 1) % tabs.length;

    const pickEnabled = (start: number, step: (n: number) => number) => {
      let i = start;
      for (let k = 0; k < tabs.length; k++) {
        i = step(i);
        if (!tabs[i].disabled) return tabs[i].id;
      }
      return tabs[start].id;
    };

    let targetId: string | null = null;

    switch (e.key) {
      case "ArrowLeft":
        targetId = pickEnabled(idx, prevIdx);
        break;
      case "ArrowRight":
        targetId = pickEnabled(idx, nextIdx);
        break;
      case "Home":
        targetId = tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? null;
        break;
      case "End": {
        const rev = [...tabs].reverse();
        const lastEnabled = rev.find((t) => !t.disabled)?.id;
        targetId = lastEnabled ?? tabs[tabs.length - 1]?.id ?? null;
        break;
      }
      default:
        break;
    }

    if (targetId) {
      e.preventDefault();
      if (controlledActive === undefined) setInternalActive(targetId);
      onChange?.(targetId);
    }
  };

  const pad = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";

  return (
    <div
      className={cn("flex items-center gap-1 border-b border-gray-200", className)}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
    >
      {tabs.map((t) => {
        const active = t.id === currentActive;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            disabled={t.disabled}
            onClick={() => handleClick(t.id, t.disabled)}
            className={cn(
              "relative select-none rounded-t-md border-b-2",
              pad,
              active
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300",
              t.disabled && "opacity-50 cursor-not-allowed"
            )}
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
