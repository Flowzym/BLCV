export type Provider = 'gpt' | 'mistral' | 'claude';

export interface ChatOptions {
  provider?: Provider;
  prompt: string;
  timeoutMs?: number;
  maxRetries?: number;
}

function sleep(ms:number){ return new Promise(res=>setTimeout(res, ms)); }
function backoff(attempt:number){ return Math.min(1000 * 2 ** attempt, 8000); }

async function mockReply(_: string) {
  return "Mock: KI nicht konfiguriert";
}

async function callProvider(provider: Provider, prompt: string): Promise<string> {
  // Real HTTP calls intentionally omitted; rely on existing stubs or mocks
  return mockReply(prompt);
}

export async function chat(opts: ChatOptions): Promise<string> {
  const provider = opts.provider ?? 'gpt';
  const timeout = opts.timeoutMs ?? 20000;
  const maxRetries = Math.max(0, Math.min(5, opts.maxRetries ?? 2));

  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(()=>ctrl.abort(), timeout);
      const res = await callProvider(provider, opts.prompt);
      clearTimeout(timer);
      return res;
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) {
        await sleep(backoff(attempt));
        continue;
      }
      throw e;
    }
  }
  throw lastError || new Error("Unknown AI error");
}
