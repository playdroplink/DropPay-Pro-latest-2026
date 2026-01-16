import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import droppayLogo from '@/assets/droppay-logo.png';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check localStorage directly to avoid context issues
    const storedUser = localStorage.getItem('pi_user');
    setIsAuthenticated(!!storedUser);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-background border-b border-border shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={droppayLogo}
              alt="DropPay Logo" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-bold text-foreground">DropPay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
            <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              API Docs
            </Link>
            <Link to="/ai-support" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium">
              AI Support
            </Link>
            <Link to="/dashboard/help" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Help
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border bg-background rounded-lg shadow-md">
            <nav className="flex flex-col gap-4">
              <a 
                href="#features" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <Link 
                to="/pricing" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/docs" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                API Docs
              </Link>
              <Link 
                to="/ai-support" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 flex items-center gap-1 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Support
              </Link>
              <Link 
                to="/dashboard/help" 
                className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Help
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <ThemeToggle />
                {isAuthenticated ? (
                  <Button asChild>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}