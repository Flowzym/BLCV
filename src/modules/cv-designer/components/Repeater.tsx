import React from 'react';

export function Repeater<T>({ 
  items, 
  children 
}: { 
  items: T[]; 
  children: (item: T, i: number) => React.ReactNode 
}) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <>
      {items.map((it, i) => (
        <React.Fragment key={(it as any).id ?? i}>
          {children(it, i)}
        </React.Fragment>
      ))}
    </>
  );
}