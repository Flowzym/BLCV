import React, { ReactNode } from 'react';

export function Accordion({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

interface ItemProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ children, defaultOpen = false }: ItemProps) {
  return (
    <details open={defaultOpen} className="border rounded-md">
      {children}
    </details>
  );
}

export function AccordionHeader({ children }: { children: ReactNode }) {
  return (
    <summary className="cursor-pointer list-none px-4 py-2 flex items-center justify-between">
      {children}
    </summary>
  );
}

export function AccordionContent({ children }: { children: ReactNode }) {
  return <div className="px-4 pb-4 pt-0">{children}</div>;
}
