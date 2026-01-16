import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminRouteGuard } from '@/components/AdminRouteGuard';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  CreditCard,
  Link2,
  ShieldCheck
} from 'lucide-react';

interface AdminStats {
  totalMerchants: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: number;
  completedWithdrawals: number;
  completedWithdrawalAmount: number;
  totalPaymentLinks: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalMerchants: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalAmount: 0,
    completedWithdrawals: 0,
    completedWithdrawalAmount: 0,
    totalPaymentLinks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Use the new admin revenue stats function
      const { data: revenueStats, error: revenueError } = await supabase.rpc('get_admin_revenue_stats');
      
      if (revenueError) {
        console.warn('Using fallback admin stats calculation:', revenueError);
        // Fallback to manual calculation
        await fetchStatsFallback();
        return;
      }
      
      if (revenueStats && revenueStats.length > 0) {
        const stats = revenueStats[0];
        
        // Get additional counts
        const { count: merchantCount } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true });

        const { count: linksCount } = await supabase
          .from('payment_links')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalMerchants: merchantCount || 0,
          totalTransactions: stats.total_transactions || 0,
          totalRevenue: Number(stats.total_gross_revenue) || 0,
          pendingWithdrawals: stats.pending_withdrawals_count || 0,
          pendingWithdrawalAmount: Number(stats.pending_withdrawals_amount) || 0,
          completedWithdrawals: stats.completed_withdrawals_count || 0,
          completedWithdrawalAmount: Number(stats.completed_withdrawals_amount) || 0,
          totalPaymentLinks: linksCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      await fetchStatsFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatsFallback = async () => {
    try {
      // Fetch merchants count
      const { count: merchantCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true });

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status');

      const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('amount, status');

      const pending = withdrawals?.filter(w => w.status === 'pending') || [];
      const completed = withdrawals?.filter(w => w.status === 'completed') || [];

      // Fetch payment links count
      const { count: linksCount } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalMerchants: merchantCount || 0,
        totalTransactions: transactions?.length || 0,
        totalRevenue,
        pendingWithdrawals: pending.length,
        pendingWithdrawalAmount: pending.reduce((sum, w) => sum + Number(w.amount), 0),
        completedWithdrawals: completed.length,
        completedWithdrawalAmount: completed.reduce((sum, w) => sum + Number(w.amount), 0),
        totalPaymentLinks: linksCount || 0,
      });
    } catch (error) {
      console.error('Error in fallback stats fetch:', error);
    }
  };

  return (
    <AdminRouteGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Platform overview and management
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Merchants
                </CardTitle>
                <Users className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalMerchants}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered on platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  π {stats.totalRevenue.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalTransactions} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Withdrawals
                </CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.pendingWithdrawals}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  π {stats.pendingWithdrawalAmount.toFixed(4)} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Payment Links
                </CardTitle>
                <Link2 className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalPaymentLinks}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Created by merchants
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>Quick access to admin functions</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Link to="/admin/withdrawals">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Manage Withdrawals</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.pendingWithdrawals} pending requests
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </Link>

              <Card className="bg-secondary/30 border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Completed Payouts</p>
                      <p className="text-sm text-muted-foreground">
                        π {stats.completedWithdrawalAmount.toFixed(4)} total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AdminRouteGuard>
  );
}
