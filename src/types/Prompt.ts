export interface PromptConfig {
  label: string;
  prompt: string;
  title?: string;
  role?: string;
  style?: string;
  examples?: string;
}

export interface PromptState {
  documents: Record<string, PromptConfig>;
  edits: Record<string, PromptConfig>;
  styles: Record<string, PromptConfig>;
}
