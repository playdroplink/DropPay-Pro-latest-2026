import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AUTHORIZED_ADMIN_USERNAME = 'Wain2020';
const normalizePi = (u?: string | null) => (u || '').replace(/^@/, '').trim().toLowerCase();

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('🔒 Checking admin access...');
        const storedUser = localStorage.getItem('pi_user');
        if (!storedUser) {
          console.log('❌ No stored user found');
          toast.error('Please login first');
          navigate('/auth');
          return;
        }

        const piUser = JSON.parse(storedUser);
        console.log('👤 Checking user:', piUser.username);
        const usernameOk = normalizePi(piUser?.username) === normalizePi(AUTHORIZED_ADMIN_USERNAME);

        // Allow hard-coded admin username quickly
        if (usernameOk) {
          console.log('✅ Admin user authorized:', piUser.username);
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        // Any other user is denied
        console.log('❌ Admin access denied');
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast.error('Authentication error');
        navigate('/auth');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
