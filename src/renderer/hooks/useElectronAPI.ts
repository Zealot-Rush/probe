import { useEffect, useState } from 'react';
import { ElectronAPI } from '../types';

export const useElectronAPI = () => {
  const [api, setApi] = useState<ElectronAPI | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      setApi(window.electronAPI);
      setIsReady(true);
    }
  }, []);

  return { api, isReady };
};
