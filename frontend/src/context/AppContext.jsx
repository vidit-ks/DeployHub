import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deployhub_gemini_key') || '');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('deployhub_gh_token') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiModalData, setAiModalData] = useState(null); // { deployment, logs, errorMessage }
  const [toasts, setToasts] = useState([]);

  // Save keys
  useEffect(() => {
    if (apiKey) localStorage.setItem('deployhub_gemini_key', apiKey);
    else localStorage.removeItem('deployhub_gemini_key');
  }, [apiKey]);

  useEffect(() => {
    if (githubToken) localStorage.setItem('deployhub_gh_token', githubToken);
    else localStorage.removeItem('deployhub_gh_token');
  }, [githubToken]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Developer';
    if (hour < 18) return 'Good afternoon, Developer';
    return 'Good evening, Developer';
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        githubToken,
        setGithubToken,
        isSettingsOpen,
        setIsSettingsOpen,
        aiModalData,
        setAiModalData,
        toasts,
        addToast,
        removeToast,
        greeting: getGreeting()
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
