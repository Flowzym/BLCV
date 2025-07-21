import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import 'react-quill/dist/quill.snow.css';

// BOLT-UI-ANPASSUNG 2025-01-15: StrictMode entfernt um findDOMNode-Warnungen zu eliminieren
const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
