import React from 'react';
import { useTypography } from '../context/TypographyContext';
export const StyleTypographyPanel:React.FC=()=>{ const {typo,setTypo}=useTypography(); return (<div className='space-y-2'><div className='font-medium'>Typografie</div><div className='text-sm'>Font: {typo.fontFamily} / {typo.baseSize}px / {typo.lineHeight}</div><button className='px-2 py-1 border rounded' onClick={()=>setTypo({baseSize:typo.baseSize+1})}>Größer</button></div>); };
