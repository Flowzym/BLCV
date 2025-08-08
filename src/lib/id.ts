// src/lib/id.ts
// Simple, dependency-free ID generator (nano-ish).
// Produces IDs like: el-k9s1ab-8x1k2l3m
export function genId(prefix = 'el'){ 
  const rnd = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-6);
  return `${prefix}-${time}-${rnd}`;
}
