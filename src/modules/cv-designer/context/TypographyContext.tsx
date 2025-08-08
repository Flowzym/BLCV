import React,{createContext,useContext,useState,ReactNode} from 'react';
export interface TypographyConfig{ fontFamily:string; baseSize:number; lineHeight:number; }
const defaultTypography:TypographyConfig={fontFamily:'Inter',baseSize:14,lineHeight:1.5};
const Ctx = createContext<{typo:TypographyConfig; setTypo:(p:Partial<TypographyConfig>)=>void}|null>(null);
export const TypographyProvider:React.FC<{children:ReactNode}>=({children})=>{const[typo,setTypoState]=useState(defaultTypography); const setTypo=(p:Partial<TypographyConfig>)=>setTypoState(prev=>({...prev,...p})); return <Ctx.Provider value={{typo,setTypo}}>{children}</Ctx.Provider>}
export const useTypography=()=>{const v=useContext(Ctx); if(!v) throw new Error('useTypography must be used within TypographyProvider'); return v;};
