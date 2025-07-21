import { KIModelSettings } from "../types/KIModelSettings";

export const defaultKIModels: KIModelSettings[] = [
  {
    name: "Mistral 7B Instruct",
    id: "17b3549d-999f-459c-ad3f-08b472113bac",
    model: "mistral-7b-instruct",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    api_key: "",
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 1024,
    active: true,
  },
  {
    name: "Mixtral 8x7B Instruct",
    id: "09b8ef48-4099-479a-bcaa-8942990c4d60",
    model: "mixtral-8x7b-instruct",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    api_key: "",
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 2048,
    active: false,  }];
