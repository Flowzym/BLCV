import React from 'react'; import type { CVData, StyleConfig } from '@/types/cv-designer';
const CVPreview:React.FC<{data?:Partial<CVData>; styleConfig?:Partial<StyleConfig>}> = ({data,styleConfig}) => (<div style={{background:styleConfig?.backgroundColor||'#fff'}} className='p-6 rounded-xl shadow'><h2 className='text-xl font-bold mb-2'>CV Preview</h2><pre className='text-xs bg-gray-50 p-3 rounded border overflow-auto'>{JSON.stringify(data||{},null,2)}</pre></div>);
export default CVPreview;
