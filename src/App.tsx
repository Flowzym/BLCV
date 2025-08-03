import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import { LebenslaufProvider } from "@/components/LebenslaufContext";
import HomePage from "@/pages/HomePage";
import DesignerPage from "@/pages/DesignerPage";
import CVPlayground from "@/pages/CVPlayground";
import StyleTest from "@/pages/StyleTest";

import { StyleConfig, LayoutElement } from "@/types/cv-designer";
import { defaultStyleConfig } from "@/modules/cv-designer/config/defaultStyleConfig";

function App() {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyleConfig);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);

  return (
    <LebenslaufProvider>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              styleConfig={styleConfig}
              setStyleConfig={setStyleConfig}
              layoutElements={layoutElements}
              setLayoutElements={setLayoutElements}
            />
          }
        />
        <Route
          path="/designer"
          element={
            <DesignerPage
              styleConfig={styleConfig}
              setStyleConfig={setStyleConfig}
              layoutElements={layoutElements}
              setLayoutElements={setLayoutElements}
            />
          }
        />
        <Route path="/playground" element={<CVPlayground />} />
        <Route path="/style-test" element={<StyleTest />} />
      </Routes>
    </LebenslaufProvider>
  );
}

export default App;
