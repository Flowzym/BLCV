import { createRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// **Global Styles**
import './tokens.css';                    // Design-Tokens (CSS-Variablen)
import './index.css';                     // Tailwind + Custom
import 'react-quill/dist/quill.snow.css'; // Quill-Editor Styles

// StrictMode absichtlich aus für alte Libs (findDOMNode-Warnungen)
const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
