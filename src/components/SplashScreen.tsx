import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import droppayLogo from '@/assets/droppay-logo.png';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-fade-in">
        <img 
          src={droppayLogo}
          alt="DropPay Logo" 
          className="w-24 h-24 mx-auto rounded-2xl object-cover animate-bounce"
        />
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">DropPay</h1>
          <p className="text-muted-foreground">Accept Pi Payments Instantly</p>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-muted-foreground mt-8">
          Powered by Droplink & Dropstore
          <br />
          <span className="text-xs">under Mrwain Organization</span>
        </p>
      </div>
    </div>
  );
}
