import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './theme.css';
import {applySavedTheme} from "../src/utils/themeUtils"

function App() {
  useEffect(() => {
    applySavedTheme();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;