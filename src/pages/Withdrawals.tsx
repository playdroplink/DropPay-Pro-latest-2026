import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ArrowUpRight, History, AlertCircle, CheckCircle, Loader2, Info, Clock, Ban, Send, User, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  txid: string | null;
  created_at: string;
  completed_at: string | null;
  wallet_address: string | null;
  pi_username: string | null;
  withdrawal_type?: string;
}

interface MerchantBalance {
  available_balance: number;
  total_withdrawn: number;
}

// Feature flags and messaging
const A2U_ENABLED = false; // A2U unavailable until Pi Network mainnet
const ESTIMATED_PAYOUT_TIME = '24–72 hours'; // typical manual payout arrival window

export default function Withdrawals() {
  const { isAuthenticated, isLoading, merchant, piUser, isPiBrowser } = useAuth();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState<MerchantBalance>({ available_balance: 0, total_withdrawn: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [piUsername, setPiUsername] = useState('');
  const [totalEarned, setTotalEarned] = useState(0);
  const [platformFeesPaid, setPlatformFeesPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [withdrawalType, setWithdrawalType] = useState<'manual' | 'a2u'>('manual');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (merchant) {
      fetchBalance();
      fetchWithdrawals();
      fetchEarnings();
    }
  }, [merchant]);

  useEffect(() => {
    // Pre-fill Pi username and wallet address from auth
    if (piUser?.username) {
      setPiUsername(piUser.username);
    }
    // Use type assertion to access wallet_address if present
    if (
      piUser &&
      typeof (piUser as any).wallet_address === 'string' &&
      withdrawalType === 'manual'
    ) {
      setWalletAddress((piUser as any).wallet_address);
    }
  }, [piUser, withdrawalType]);

  const fetchBalance = async () => {
    if (!merchant) return;

    try {
      // Use the new accurate balance calculation function
      const { data, error } = await supabase.rpc('get_merchant_accurate_balance', {
        merchant_uuid: merchant.id
      });

      if (error) {
        // Fallback to direct table query if function doesn't exist yet
        console.warn('Using fallback balance calculation:', error);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('merchants')
          .select('available_balance, total_withdrawn')
          .eq('id', merchant.id)
          .single();
          
        if (fallbackError) throw fallbackError;
        setBalance({
          available_balance: Number(fallbackData?.available_balance) || 0,
          total_withdrawn: Number(fallbackData?.total_withdrawn) || 0,
        });
      } else if (data && data.length > 0) {
        setBalance({
          available_balance: Number(data[0].available_balance) || 0,
          total_withdrawn: Number(data[0].total_withdrawn) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchWithdrawals = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);

      // Calculate pending amount
      const pending = (data || [])
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + Number(w.amount), 0);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchEarnings = async () => {
    if (!merchant) return;

    try {
      // Get total from completed transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed');

      if (txError) throw txError;

      const total = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      setTotalEarned(total);

      // Get platform fees paid (for maintenance & future features)
      const { data: fees, error: feesError } = await supabase
        .from('platform_fees')
        .select('amount')
        .eq('merchant_id', merchant.id)
        .eq('status', 'completed');

      if (feesError) throw feesError;

      const totalFees = fees?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
      setPlatformFeesPaid(totalFees);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const handleAuthenticatePi = async () => {
    if (!isPiBrowser) {
      toast.error('Please open in Pi Browser to authenticate');
      return;
    }

    try {
      const Pi = (window as any).Pi;
      console.log('⏳ Calling window.Pi.authenticate() with reqScopes: [username, payments, wallet_address]');
      
      const authResult = await Pi.authenticate(['username', 'payments', 'wallet_address'], () => {});
      
      if (authResult?.user?.username) {
        setPiUsername(authResult.user.username);
        toast.success(`Authenticated as @${authResult.user.username}`);
      }
      // Auto-fill wallet address if available from Pi auth
      if (authResult?.user?.wallet_address) {
        setWalletAddress(authResult.user.wallet_address);
      }
      if (authResult?.user?.wallet_address && withdrawalType === 'manual') {
        setWalletAddress(authResult.user.wallet_address);
        toast.success('Wallet address auto-filled from Pi authentication');
      }
    } catch (error) {
      console.error('Pi authentication error:', error);
      toast.error('Failed to authenticate with Pi Network');
    }
  };

  const handleWithdraw = async () => {
    if (!merchant || !withdrawAmount) {
      toast.error('Please enter an amount');
      return;
    }

    if (withdrawalType === 'manual' && !walletAddress.trim()) {
      toast.error('Please enter your Pi wallet address');
      return;
    }

    if (withdrawalType === 'a2u' && !A2U_ENABLED) {
      toast.error('A2U is not available yet because Pi Network is not live on mainnet. Please use Manual withdrawal.');
      return;
    }

    if (!piUsername.trim()) {
      toast.error('Please authenticate with Pi or enter your username');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const effectiveBalance = balance.available_balance - pendingAmount;
    if (amount > effectiveBalance) {
      toast.error('Insufficient available balance');
      return;
    }

    setIsProcessing(true);

    try {
      // Create a pending withdrawal request
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          merchant_id: merchant.id,
          amount: amount,
          status: 'pending',
          wallet_address: withdrawalType === 'manual' ? walletAddress.trim() : null,
          pi_username: piUsername.trim(),
          withdrawal_type: withdrawalType,
        });

      if (error) throw error;

      toast.success(`${withdrawalType === 'a2u' ? 'A2U' : 'Manual'} withdrawal request submitted! Awaiting admin approval.`);
      setIsDialogOpen(false);
      setWithdrawAmount('');
      setWalletAddress('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <Ban className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const effectiveBalance = balance.available_balance - pendingAmount;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Withdrawals</h1>
            <p className="text-muted-foreground mt-1">
              Manage your earnings and payouts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/ai-support">
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Need Help?
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={effectiveBalance <= 0}>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogDescription>
                  Choose your withdrawal method and enter details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-700">
                    Payouts are processed manually. During busy periods, processing can take longer. For assistance, email support@droppay.space.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-foreground">
                    π {effectiveBalance.toFixed(7)}
                  </p>
                  {pendingAmount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      (π {pendingAmount.toFixed(4)} pending approval)
                    </p>
                  )}
                </div>

                {/* Fee Breakdown Info */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <p className="text-xs font-medium text-blue-600">💡 Withdrawal Fee Structure</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Platform fee (2% for maintenance & future features):</span>
                      <span className="font-medium">2% of withdrawal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing fee:</span>
                      <span className="font-medium">Free</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Platform fee (2%) is deducted from withdrawal amount for maintenance and future features. You'll receive 98% of requested amount.
                  </p>
                  <p className="text-[10px] text-blue-600/70 mt-1 italic">
                    Platform fees support maintenance and enable future features for the best experience.
                  </p>
                </div>

                {/* Withdrawal Type Tabs */}
                <Tabs value={withdrawalType} onValueChange={(v) => setWithdrawalType(v as 'manual' | 'a2u')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual" className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Manual
                    </TabsTrigger>
                    <TabsTrigger value="a2u" className="flex items-center gap-2" disabled={!A2U_ENABLED}>
                      <Send className="w-4 h-4" />
                      A2U (Coming Soon)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4 mt-4">
                    {/* Pi Authentication */}
                    <div className="space-y-2">
                      <Label htmlFor="pi_username">Pi Username *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="pi_username"
                          placeholder="Your Pi username"
                          value={piUsername}
                          onChange={(e) => setPiUsername(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAuthenticatePi}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="space-y-2">
                      <Label htmlFor="wallet_address">Pi Wallet Address *</Label>
                      <Input
                        id="wallet_address"
                        placeholder="GXXXX..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Pi Network mainnet wallet address
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-600">
                        <p className="font-medium">Manual Withdrawal:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Submit request with wallet address</li>
                          <li>Admin reviews and approves</li>
                          <li>Pi is sent to your wallet manually</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="a2u" className="space-y-4 mt-4">
                    {/* Pi Authentication */}
                    <div className="space-y-2">
                      <Label htmlFor="pi_username_a2u">Pi Username *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="pi_username_a2u"
                          placeholder="Your Pi username"
                          value={piUsername}
                          onChange={(e) => setPiUsername(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAuthenticatePi}
                        >
                          <User className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Authenticate to verify your Pi username
                      </p>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Send className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-600">
                        <p className="font-medium">A2U (App-to-User) Withdrawal:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Faster processing via Pi SDK</li>
                          <li>Direct transfer to your Pi account</li>
                          <li>No wallet address needed</li>
                          <li>Requires Pi Browser authentication</li>
                        </ul>
                        {!A2U_ENABLED && (
                          <p className="mt-2 text-xs text-amber-700">
                            Not available yet: Pi Network is not live on mainnet. Please use Manual withdrawal.
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Withdraw (π) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0000001"
                    min="0"
                    max={effectiveBalance}
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-sm"
                    onClick={() => setWithdrawAmount(effectiveBalance.toString())}
                  >
                    Withdraw all
                  </Button>

                  {/* Withdrawal Fee Breakdown */}
                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                      <p className="text-xs font-medium text-amber-700">💰 You'll Receive</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Withdrawal amount:</span>
                          <span className="font-medium">π {parseFloat(withdrawAmount).toFixed(7)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee (2% for maintenance & future features):</span>
                          <span className="font-medium text-amber-600">-π {(parseFloat(withdrawAmount) * 0.02).toFixed(7)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
                          <span className="font-semibold">Net payout:</span>
                          <span className="font-bold text-foreground">π {(parseFloat(withdrawAmount) * 0.98).toFixed(7)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-700/70 mt-1 italic">
                        Platform fees (2%) support maintenance, security, and enable future features for the best experience.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleWithdraw} disabled={isProcessing || (!A2U_ENABLED && withdrawalType === 'a2u')}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {withdrawalType === 'a2u' ? <Send className="w-4 h-4 mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                      Submit {withdrawalType === 'a2u' ? 'A2U' : 'Manual'} Request
                    </>
                  )}
                </Button>
                {!A2U_ENABLED && withdrawalType === 'a2u' && (
                  <p className="text-xs text-amber-700 mt-2">A2U is coming soon once Pi Network mainnet is available.</p>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

          {/* Payout Delay Note */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-700">
              Note: Payouts are processed manually and may take longer during high volume of withdrawals. Estimated arrival: {ESTIMATED_PAYOUT_TIME}. If your payout is delayed, please email support@droppay.space.
            </p>
          </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {effectiveBalance.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to withdraw
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {totalEarned.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From all sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {pendingAmount.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting admin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Withdrawn
              </CardTitle>
              <History className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {balance.total_withdrawn.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                To your wallet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platform Fees
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {platformFeesPaid.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per payment link
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>
              All your past withdrawals and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No withdrawals yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your withdrawal history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => {
                  const platformFee = Number(withdrawal.amount) * 0.02;
                  const netAmount = Number(withdrawal.amount) * 0.98;
                  
                  return (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            π {Number(withdrawal.amount).toFixed(4)}
                          </p>
                          {withdrawal.withdrawal_type === 'a2u' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">
                              A2U
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(withdrawal.created_at).toLocaleDateString()} • @{withdrawal.pi_username}
                        </p>
                        {/* Fee Breakdown */}
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <p>Platform fee (2% for maintenance & future features): π {platformFee.toFixed(7)}</p>
                          <p className="font-medium">Net received: π {netAmount.toFixed(7)}</p>
                        </div>
                        {withdrawal.wallet_address && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {withdrawal.wallet_address.slice(0, 12)}...{withdrawal.wallet_address.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                      {withdrawal.txid && (
                        <a
                          href={withdrawal.txid?.startsWith('http') ? withdrawal.txid : `https://blockexplorer.minepi.com/tx/${withdrawal.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary hover:underline mt-1"
                        >
                          View TX
                        </a>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}
