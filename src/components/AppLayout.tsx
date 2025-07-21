import React from 'react';
import LebenslaufEditor from './LebenslaufEditor';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <LebenslaufEditor />
      </div>
    </div>
  );
}