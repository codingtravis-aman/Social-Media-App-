/**
 * Register the service worker for PWA functionality
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

/**
 * Check if the app can be installed (via PWA)
 */
export function setupInstallPrompt() {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally, send an analytics event that PWA install is available
    console.log('App can be installed as PWA, showing install button');
    
    // Show UI element to promote install
    document.dispatchEvent(new CustomEvent('pwaInstallable', { detail: true }));
  });
  
  // Return a function that can be called to show the install prompt
  return () => {
    if (!deferredPrompt) {
      console.log('Cannot show install prompt - not available');
      return Promise.reject('Install prompt not available');
    }
    
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    return deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can only be used once
      deferredPrompt = null;
      
      // Hide UI element promoting install
      document.dispatchEvent(new CustomEvent('pwaInstallable', { detail: false }));
      
      return choiceResult;
    });
  };
}