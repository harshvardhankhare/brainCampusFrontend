import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import AuthInitializer from './redux/AuthInitializer.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <AuthInitializer>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthInitializer>
  </Provider>
)