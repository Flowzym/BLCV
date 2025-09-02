import { beforeAll } from 'vitest';

beforeAll(() => {
  // jsdom sometimes lacks scrollTo
  (globalThis as any).scrollTo = () => {};
});
