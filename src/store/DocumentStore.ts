import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Section } from "@/types/section";

export interface CoverLetterBlock { id: string; text: string }

export interface StyleConfig {
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
  spacing: number;
}

interface DocumentState {
  cvSections: Section[];
  coverLetterSections: CoverLetterBlock[];
  styleConfig: StyleConfig;

  setCvSections(sec: Section[]): void;
  setCoverLetter(blocks: CoverLetterBlock[]): void;
  updateStyleConfig(partial: Partial<StyleConfig>): void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    immer((set) => ({
      cvSections: [],
      coverLetterSections: [],
      styleConfig: {
        fontFamily: 'Inter',
        fontSize: 12,
        colorPrimary: '#111827',
        spacing: 8,
      },
      setCvSections: (sec) => set((s)=>{s.cvSections = sec;}),
      setCoverLetter: (b) => set((s)=>{s.coverLetterSections = b;}),
      updateStyleConfig: (p)=>set((s)=>{s.styleConfig = {...s.styleConfig, ...p};})
    })),
    { name: "better_letter_document_v1" }
  )
);
