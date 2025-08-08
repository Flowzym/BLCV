import { chat as chatAI } from './aiClient';




type Model = "mistral" | "claude" | "gpt";
interface AIOpts { model?: Model; prompt: string }

export async function aiChat({ model = "gpt", prompt }: AIOpts) {
  try {
    return await chatAI({ provider: model as any, prompt });
  } catch (e:any) {
    // optional mode: if env/config missing, surface a soft error
    const msg = "KI derzeit nicht konfiguriert";
    const err = new Error(msg);
    (err as any).cause = e;
    throw err;
  }
}
