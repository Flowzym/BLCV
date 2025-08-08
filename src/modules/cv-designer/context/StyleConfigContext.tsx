import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { StyleConfig } from '@/types/cv-designer';
import { defaultStyleConfig } from '../config/defaultStyleConfig';
const Ctx = createContext<{ style: StyleConfig; setStyle: (p: Partial<StyleConfig>) => void } | null>(null);
export const StyleConfigProvider: React.FC<{children: ReactNode}> = ({children})=>{ const [style, setStyleState]=useState<StyleConfig>(defaultStyleConfig); const setStyle=(p:Partial<StyleConfig>)=>setStyleState(prev=>({...prev,...p})); return <Ctx.Provider value={{style,setStyle}}>{children}</Ctx.Provider>}
export const useStyleConfig = ()=>{ const v = useContext(Ctx); if(!v) throw new Error('useStyleConfig must be used within StyleConfigProvider'); return v; };
