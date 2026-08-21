import { useEffect } from 'react';
import { AppProvider } from './providers';
import { AppRouter } from './router';
import { useThemeStore } from '../stores/themeStore';

export function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
