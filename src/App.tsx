import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LebenslaufProvider } from "@/components/LebenslaufContext";
import HomePage from "@/pages/HomePage";
import DesignerPage from "@/pages/DesignerPage";
import CVPlayground from "@/pages/CVPlayground";
import SettingsPage from "@/pages/SettingsPage";
import StyleTest from "@/pages/StyleTest";

import { StyleConfig, LayoutElement } from "@/types/cv-designer";
import { defaultStyleConfig } from "@/modules/cv-designer/config/defaultStyleConfig";

function App() {
  // 🔑 States zentral hier hochgezogen
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyleConfig);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);

  return (
    <LebenslaufProvider>
      <Router>
        <Routes>
          {/* Home mit Tabs */}
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

          {/* Designer auch direkt per Route */}
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

          {/* Weitere Seiten */}
          <Route path="/playground" element={<CVPlayground />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/style-test" element={<StyleTest />} />
        </Routes>
      </Router>
    </LebenslaufProvider>
  );
}

export default App;
