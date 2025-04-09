import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setupInstallPrompt } from "@/lib/register-sw";

export function PWAInstallButton() {
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<() => Promise<any>>(() => {
    return Promise.reject("Install prompt not initialized");
  });

  useEffect(() => {
    // Set up the install prompt and get the function to trigger it
    const promptInstall = setupInstallPrompt();
    setInstallPrompt(() => promptInstall);

    // Listen for pwaInstallable events
    const handleInstallable = (event: CustomEvent<boolean>) => {
      setShowInstall(event.detail);
    };

    document.addEventListener('pwaInstallable', handleInstallable as EventListener);
    
    return () => {
      document.removeEventListener('pwaInstallable', handleInstallable as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    try {
      await installPrompt();
      // After installation attempt, hide the button
      setShowInstall(false);
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  if (!showInstall) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      onClick={handleInstallClick}
    >
      <Download className="h-4 w-4" />
      <span>Install App</span>
    </Button>
  );
}