import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContextProvider.tsx';
import { store } from './redux/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <ThemeProvider defaultTheme='system'>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </Provider>
  </StrictMode>
);
