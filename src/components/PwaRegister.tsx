'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Quando un nuovo service worker prende il controllo della pagina
      // (dopo un deploy), ricarichiamo automaticamente una sola volta:
      // senza questo, chi ha l'app già aperta (specialmente da PWA
      // installata su mobile) resta bloccato sulla versione JS vecchia
      // finché non chiude e riapre manualmente l'app.
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .catch((err) => console.error('SW registration failed:', err));
      });
    }
  }, []);

  return null;
}
