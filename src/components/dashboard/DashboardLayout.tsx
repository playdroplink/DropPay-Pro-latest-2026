import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Link2,
  History,
  Code,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Code2,
  Play,
  Crown,
  BookOpen,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from '@/components/theme-toggle';
import { TutorialModal } from './TutorialModal';
import dropPayLogo from '@/assets/droppay-logo.png';

interface NavSection {
  title: string;
  items: Array<{
    icon: any;
    label: string;
    href: string;
    disabled?: boolean;
    badge?: string;
  }>;
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Payment Links',
    items: [
      { icon: Link2, label: 'Payment Links', href: '/dashboard/links' },
      { icon: Link2, label: 'Checkout Links', href: '/dashboard/checkout-links', disabled: true, badge: 'Coming Soon' },
    ],
  },
  {
    title: 'Financial',
    items: [
      { icon: History, label: 'Transactions', href: '/dashboard/transactions' },
      { icon: ArrowLeftRight, label: 'Wallet', href: '/dashboard/ewallet' },
      { icon: Wallet, label: 'Withdrawals', href: '/dashboard/withdrawals' },
      { icon: Crown, label: 'Subscription Plan', href: '/dashboard/subscription' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { icon: Play, label: 'Watch Ads & Earn', href: '/dashboard/watch-ads' },
    ],
  },
  {
    title: 'Developer',
    items: [
      { icon: Code2, label: 'Widgets & Embeds', href: '/dashboard/widgets' },
      { icon: Code, label: 'API & Webhooks', href: '/dashboard/api' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: MessageCircle, label: 'AI Support', href: '/ai-support' },
      { icon: BookOpen, label: 'Help & Tutorials', href: '/dashboard/help' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ],
  },
];

const adminItems = [
  { icon: ShieldCheck, label: 'Admin Dashboard', href: '/admin/dashboard' },
  { icon: Wallet, label: 'Admin: Withdrawals', href: '/admin/withdrawals' },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { piUser, merchant, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      // Check username first (fast check)
      const normalizedUsername = piUser?.username?.toLowerCase().replace(/^@/, '');
      if (normalizedUsername === 'wain2020') {
        console.log('✓ Admin detected via username:', piUser?.username);
        setIsAdmin(true);
        return;
      }

      // Then check database flag
      if (merchant?.id) {
        try {
          const { data, error } = await supabase
            .from('merchants')
            .select('is_admin, pi_username')
            .eq('id', merchant.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking admin status:', error);
          }

          const dbIsAdmin = data?.is_admin === true;
          const dbUsername = data?.pi_username?.toLowerCase().replace(/^@/, '');
          const isAdminUser = dbIsAdmin || dbUsername === 'wain2020';
          
          console.log('Admin check result:', { 
            dbIsAdmin, 
            dbUsername, 
            isAdminUser,
            merchantId: merchant.id 
          });
          
          setIsAdmin(isAdminUser);
        } catch (err) {
          console.error('Admin check failed:', err);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdmin();
  }, [merchant?.id, piUser?.username]);

  const getAllNavSections = (): NavSection[] => {
    if (isAdmin) {
      return [
        ...navSections,
        {
          title: 'Admin',
          items: adminItems,
        },
      ];
    }
    return navSections;
  };

  // Debug log
  useEffect(() => {
    console.log('🔑 Admin Status:', { 
      isAdmin, 
      username: piUser?.username,
      merchantId: merchant?.id,
      merchantIsAdmin: merchant?.is_admin 
    });
  }, [isAdmin, piUser?.username, merchant?.id, merchant?.is_admin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex lg:flex-col">
        {/* Header - Fixed */}
        <div className="flex-none p-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={dropPayLogo} 
                alt="DropPay Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold text-sidebar-foreground">DropPay</span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 space-y-6 overflow-y-auto min-h-0 py-4">
          {getAllNavSections().map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isDisabled = item.disabled || false;
                  const LinkComponent = isDisabled ? 'div' : Link;
                  
                  return (
                    <LinkComponent
                      key={item.href}
                      {...(!isDisabled && { to: item.href })}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isDisabled 
                          ? 'text-muted-foreground cursor-not-allowed opacity-60'
                          : location.pathname === item.href
                            ? 'bg-sidebar-accent text-sidebar-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-2 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </LinkComponent>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer with user info and logout - Fixed */}
        <div className="flex-none p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sidebar-foreground font-medium">
                {piUser?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                @{piUser?.username || 'user'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {merchant?.business_name || 'Merchant'}
              </p>
                {isAdmin && (
                  <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0.5">Admin</Badge>
                )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-sidebar-foreground hover:text-destructive"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={dropPayLogo} 
              alt="DropPay Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-foreground">DropPay</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="text-sidebar-foreground"
              title="Tutorial Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-sidebar-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-sidebar border-b border-sidebar-border max-h-[70vh] overflow-y-auto">
            <nav className="p-4 space-y-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium">
                    {piUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm text-sidebar-foreground truncate">
                    @{piUser?.username || 'user'}
                  </div>
                </div>
                {isAdmin && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Admin</Badge>
                )}
              </div>
              
              {/* Organized sections for mobile */}
              {getAllNavSections().map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isDisabled = item.disabled || false;
                      const LinkComponent = isDisabled ? 'div' : Link;
                      
                      return (
                        <LinkComponent
                          key={item.href}
                          {...(!isDisabled && { 
                            to: item.href,
                            onClick: () => setIsMobileMenuOpen(false)
                          })}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                            isDisabled
                              ? 'text-muted-foreground cursor-not-allowed opacity-60'
                              : location.pathname === item.href
                                ? 'bg-sidebar-accent text-sidebar-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-[10px] px-2 py-0.5">
                              {item.badge}
                            </Badge>
                          )}
                        </LinkComponent>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:text-destructive hover:bg-destructive/10 mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 overflow-x-hidden">
        <div className="p-4 sm:p-6 lg:p-8 max-w-full">{children}</div>
      </main>

      {/* Tutorial Modal */}
      <TutorialModal open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
}
