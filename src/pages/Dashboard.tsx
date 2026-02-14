import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Link2, ArrowUpRight, TrendingUp, Plus, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalRevenue: number;
  totalTransactions: number;
  activeLinks: number;
  pendingPayments: number;
}

interface RecentTransaction {
  id: string;
  amount: number;
  status: string;
  payer_pi_username: string | null;
  created_at: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

interface LinkPerformance {
  title: string;
  views: number;
  conversions: number;
  revenue: number;
}

function Dashboard() {
  const { isAuthenticated, isLoading, merchant, piUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalTransactions: 0,
    activeLinks: 0,
    pendingPayments: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [linkPerformance, setLinkPerformance] = useState<LinkPerformance[]>([]);
  const [paymentTypeDistribution, setPaymentTypeDistribution] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    if (merchant) {
      fetchStats();
      fetchRecentTransactions();
      fetchAnalytics();
      
      // Set up auto-refresh to pick up new transactions every 5 seconds
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard...');
        fetchStats();
        fetchRecentTransactions();
        fetchAnalytics();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [merchant]);

  const fetchStats = async () => {
    if (!merchant) return;

    try {
      console.log('📊 Fetching dashboard stats for merchant:', merchant.id);
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('merchant_id', merchant.id);
      const { data: merchantBalances } = await supabase
        .from('merchants')
        .select('revenue_balance')
        .eq('id', merchant.id)
        .maybeSingle();

      const completedTransactions = transactions?.filter((t) => t.status === 'completed') || [];
      const historicalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalRevenue = Number((merchantBalances as any)?.revenue_balance ?? historicalRevenue);
      const pendingPayments = transactions?.filter((t) => t.status === 'pending').length || 0;

      console.log('💰 Transaction summary:', { 
        completed: completedTransactions.length, 
        revenue: totalRevenue, 
        pending: pendingPayments,
        total: transactions?.length 
      });

      // Count payment links
      const { count: activePaymentLinks } = await supabase
        .from('payment_links')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('is_active', true);

      // Count checkout links
      let activeCheckoutLinks = 0;
      try {
        const checkoutResult: any = await (supabase as any)
          .from('checkout_links')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchant.id)
          .eq('is_active', true);
        
        activeCheckoutLinks = checkoutResult.count || 0;
      } catch (error) {
        console.warn('checkout_links table might not exist yet:', error);
      }

      const totalActiveLinks = (activePaymentLinks || 0) + activeCheckoutLinks;

      setStats({
        totalRevenue,
        totalTransactions: transactions?.length || 0,
        activeLinks: totalActiveLinks,
        pendingPayments,
      });
      
      console.log('✅ Stats updated:', { totalRevenue, totalTransactions: transactions?.length || 0, activeLinks: totalActiveLinks, pendingPayments });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!merchant) return;

    try {
      console.log('📋 Fetching recent transactions...');
      const { data } = await supabase
        .from('transactions')
        .select('id, amount, status, payer_pi_username, created_at')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('✅ Recent transactions loaded:', data?.length || 0);
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!merchant) return;

    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status, created_at')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      const revenueByDate: Record<string, { revenue: number; transactions: number }> = {};
      transactions?.forEach((tx) => {
        const date = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!revenueByDate[date]) {
          revenueByDate[date] = { revenue: 0, transactions: 0 };
        }
        revenueByDate[date].revenue += Number(tx.amount);
        revenueByDate[date].transactions += 1;
      });

      const chartData = Object.entries(revenueByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.transactions,
      }));
      setRevenueData(chartData);

      // Fetch payment links performance
      const { data: paymentLinks } = await supabase
        .from('payment_links')
        .select('id, title, views, conversions, amount')
        .eq('merchant_id', merchant.id)
        .order('conversions', { ascending: false })
        .limit(5);

      // Fetch checkout links performance
      let checkoutLinks: any[] = [];
      try {
        const checkoutResult: any = await (supabase as any)
          .from('checkout_links')
          .select('id, title, views, conversions, amount')
          .eq('merchant_id', merchant.id)
          .order('conversions', { ascending: false })
          .limit(5);
        
        checkoutLinks = checkoutResult.data || [];
      } catch (error) {
        console.warn('checkout_links table might not exist yet:', error);
      }

      // Combine and sort by conversions
      const allLinks = [...(paymentLinks || []), ...checkoutLinks]
        .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
        .slice(0, 5);

      const linkStats = allLinks.map((link) => ({
        title: link.title,
        views: link.views || 0,
        conversions: link.conversions || 0,
        revenue: (link.conversions || 0) * Number(link.amount),
      }));
      setLinkPerformance(linkStats);

      // Update payment type distribution
      const { data: allPaymentLinks } = await supabase
        .from('payment_links')
        .select('payment_type')
        .eq('merchant_id', merchant.id);

      let allCheckoutLinks: any[] = [];
      try {
        const checkoutResult: any = await (supabase as any)
          .from('checkout_links')
          .select('id')
          .eq('merchant_id', merchant.id);
        
        allCheckoutLinks = checkoutResult.data || [];
      } catch (error) {
        console.warn('checkout_links table might not exist yet:', error);
      }

      const typeCount: Record<string, number> = { 'One-Time': 0, 'Recurring': 0, 'Checkout': 0 };
      allPaymentLinks?.forEach((link) => {
        if (link.payment_type === 'one_time') typeCount['One-Time']++;
        else if (link.payment_type === 'recurring') typeCount['Recurring']++;
        else if (link.payment_type === 'checkout') typeCount['Checkout']++;
      });
      
      // Add checkout links to checkout count
      typeCount['Checkout'] += allCheckoutLinks.length;

      setPaymentTypeDistribution([
        { name: 'One-Time', value: typeCount['One-Time'] },
        { name: 'Recurring', value: typeCount['Recurring'] },
        { name: 'Checkout', value: typeCount['Checkout'] },
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {merchant?.business_name || merchant?.pi_username || piUser?.username ? `@${merchant?.pi_username || piUser?.username}` : 'merchant'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/ai-support">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Support
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard/links">
                <Plus className="w-4 h-4 mr-2" />
                Create Payment Link
              </Link>
            </Button>
          </div>
        </div>

        {/* Payment Buttons Section hidden for now */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Balance
              </CardTitle>
              <Coins className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Movable to Wallet
              </p>
              <Button asChild size="sm" className="mt-3 w-full">
                <Link to="/dashboard/withdrawals">
                  Withdraw Earnings
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Transactions
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.pendingPayments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Links
              </CardTitle>
              <Link2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeLinks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Payment links created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalTransactions > 0
                  ? Math.round(
                      ((stats.totalTransactions - stats.pendingPayments) /
                        stats.totalTransactions) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <SubscriptionStatus />

        {/* Analytics Charts */}
        <AnalyticsCharts
          revenueData={revenueData}
          linkPerformance={linkPerformance}
          paymentTypeDistribution={paymentTypeDistribution}
        />

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/transactions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/dashboard/links">Create your first payment link</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.payer_pi_username ? `@${tx.payer_pi_username}` : 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">π {Number(tx.amount).toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
