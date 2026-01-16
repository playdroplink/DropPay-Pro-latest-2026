import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Wallet, ArrowUpRight, Users, AlertCircle, Loader2, ExternalLink, Copy, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface PendingWithdrawal {
  id: string;
  amount: number;
  status: string;
  wallet_address: string | null;
  pi_username: string | null;
  withdrawal_type?: string;
  created_at: string;
  merchant_id: string;
  merchant?: {
    pi_username: string | null;
    business_name: string | null;
    available_balance: number | null;
  };
}

interface AdminStats {
  totalPending: number;
  totalPendingAmount: number;
  totalApproved: number;
  totalApprovedAmount: number;
  totalPlatformFees: number;
  totalPlatformFeesAmount: number;
}

// Platform fee rate used across approvals (for maintenance & future features)
const PLATFORM_FEE_RATE = 0.02; // 2%
const ESTIMATED_PAYOUT_TIME = '24–72 hours'; // typical manual payout arrival window

export default function AdminWithdrawals() {
  const { isAuthenticated, isLoading, merchant, piUser } = useAuth();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalPending: 0,
    totalPendingAmount: 0,
    totalApproved: 0,
    totalApprovedAmount: 0,
    totalPlatformFees: 0,
    totalPlatformFeesAmount: 0,
  });
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [transactionLink, setTransactionLink] = useState<string>('');
  const [approveDialogOpen, setApproveDialogOpen] = useState<boolean>(false);
  const [approveTxInput, setApproveTxInput] = useState<string>('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (merchant || piUser) {
      checkAdminStatus();
    }
  }, [merchant, piUser]);

  const checkAdminStatus = async () => {
    if (!piUser) return;

    try {
      const normalizePi = (u?: string | null) => (u || '').replace(/^@/, '').toLowerCase();
      const allowed = normalizePi('Wain2020');

      // Only allow @Wain2020 to access admin
      if (normalizePi(piUser.username) !== allowed) {
        toast.error('Access denied. Only @Wain2020 can access admin panel.');
        navigate('/dashboard');
        return;
      }

      // Username matches: mark admin and proceed
      setIsAdmin(true);
      if (merchant) {
        fetchWithdrawals();
        fetchStats();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          merchant:merchants(pi_username, business_name, available_balance)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = (data || []).map((w: any) => ({
        ...w,
        merchant: Array.isArray(w.merchant) ? w.merchant[0] : w.merchant
      }));

      setWithdrawals(transformedData);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch withdrawals for stats
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('amount, status');
      
      const allWithdrawals = (withdrawalsData as any) || [];
      const pending = allWithdrawals.filter((w: any) => w.status === 'pending') || [];
      const approved = allWithdrawals.filter((w: any) => w.status === 'completed' || w.status === 'approved') || [];

      // Fetch platform fees collected
      const { data: allFeesData } = await supabase
        .from('platform_fees')
        .select('amount, status, fee_type');
      
      const feesData = ((allFeesData as any) || []).filter((f: any) => f.fee_type === 'withdrawal');
      const completedFees = feesData.filter((f: any) => f.status === 'completed');

      setStats({
        totalPending: pending.length,
        totalPendingAmount: pending.reduce((sum: number, w: any) => sum + Number(w.amount), 0),
        totalApproved: approved.length,
        totalApprovedAmount: approved.reduce((sum: number, w: any) => sum + Number(w.amount), 0),
        totalPlatformFees: completedFees.length,
        totalPlatformFeesAmount: completedFees.reduce((sum: number, f: any) => sum + Number(f.amount), 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (withdrawal: PendingWithdrawal, transactionLink?: string) => {
    if (!withdrawal.wallet_address && !withdrawal.pi_username) {
      toast.error('No wallet address or Pi username provided');
      return;
    }

    setIsProcessing(withdrawal.id);

    try {
      // Generate a placeholder txid for manual processing
      const manualTxid = `manual_${Date.now()}`;
      const adminUser = localStorage.getItem('pi_user') ? JSON.parse(localStorage.getItem('pi_user') || '{}') : null;

      // Calculate platform fee (2% of withdrawal amount for maintenance & future features)
      const platformFeeAmount = withdrawal.amount * PLATFORM_FEE_RATE;
      const netWithdrawalAmount = withdrawal.amount - platformFeeAmount;

      // Update withdrawals table
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .update({
          status: 'completed',
          txid: transactionLink || manualTxid,
          completed_at: new Date().toISOString(),
          notes: `Approved by admin. Send ${netWithdrawalAmount.toFixed(4)} π (after ${platformFeeAmount.toFixed(4)} π fee) to ${withdrawal.wallet_address || withdrawal.pi_username}`,
        })
        .eq('id', withdrawal.id);

      if (withdrawalError) throw withdrawalError;

      // Deduct from merchant's available balance and update total_withdrawn
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('available_balance, total_withdrawn')
        .eq('id', withdrawal.merchant_id)
        .single();

      const currentBalance = Number(merchantData?.available_balance) || 0;
      const currentWithdrawn = Number(merchantData?.total_withdrawn) || 0;

      const { error: merchantError } = await supabase
        .from('merchants')
        .update({
          available_balance: Math.max(0, currentBalance - withdrawal.amount),
          total_withdrawn: currentWithdrawn + netWithdrawalAmount,
        })
        .eq('id', withdrawal.merchant_id);

      if (merchantError) throw merchantError;

      // Record platform fee (for maintenance & future features)
      const { error: feeError } = await supabase
        .from('platform_fees')
        .insert({
          merchant_id: withdrawal.merchant_id,
          amount: platformFeeAmount,
          fee_type: 'withdrawal',
          transaction_id: withdrawal.id,
          status: 'completed',
        });

      if (feeError) {
        console.error('Error recording platform fee:', feeError);
      }

      // Create notification for merchant
      const notificationMsg = withdrawal.wallet_address 
        ? `Your withdrawal of π${withdrawal.amount} has been approved. After 2% platform fee (π${platformFeeAmount.toFixed(4)}), you will receive π${netWithdrawalAmount.toFixed(4)} to ${withdrawal.wallet_address}${transactionLink ? ` — View transaction: ${transactionLink}` : ''}`
        : `Your withdrawal of π${withdrawal.amount} has been approved. After 2% platform fee (π${platformFeeAmount.toFixed(4)}), you will receive π${netWithdrawalAmount.toFixed(4)} to @${withdrawal.pi_username}${transactionLink ? ` — View transaction: ${transactionLink}` : ''}`;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          merchant_id: withdrawal.merchant_id,
          title: 'Withdrawal Approved ✅',
          message: notificationMsg,
          type: 'success',
          read: false,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole process if notification fails
      }

      // Send withdrawal approval email
      try {
        const merchantEmail = withdrawal.merchant?.pi_username || 'support@droppay.space';
        await supabase.functions.invoke('send-withdrawal-email', {
          body: {
            withdrawalId: withdrawal.id,
            merchantEmail,
            merchantName: withdrawal.merchant?.business_name || withdrawal.merchant?.pi_username,
            withdrawalAmount: withdrawal.amount,
            netAmount: netWithdrawalAmount,
            platformFee: platformFeeAmount,
            status: 'approved',
            destination: withdrawal.wallet_address || `@${withdrawal.pi_username}`,
            transactionLink,
            estimatedArrival: '24–72 hours',
          },
        });
      } catch (emailError) {
        console.error('Error sending withdrawal email:', emailError);
        // Don't fail the whole process if email fails
      }

      toast.success(`Approved! Send π${netWithdrawalAmount.toFixed(4)} (after π${platformFeeAmount.toFixed(4)} platform fee)`);
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast.error('Failed to approve withdrawal');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    setIsProcessing(withdrawalId);

    try {
      // Get withdrawal details first
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('amount, merchant_id')
        .eq('id', withdrawalId)
        .single();

      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          notes: 'Rejected by admin',
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      // Create notification for merchant
      if (withdrawal) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            merchant_id: withdrawal.merchant_id,
            title: 'Withdrawal Rejected ❌',
            message: `Your withdrawal request for π${withdrawal.amount} has been rejected. Please contact support if you have questions.`,
            type: 'error',
            read: false,
          });

        if (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Don't fail the whole process if notification fails
        }

        // Get merchant details for email
        const { data: merchantData } = await supabase
          .from('merchants')
          .select('pi_username, business_name')
          .eq('id', withdrawal.merchant_id)
          .single();

        // Send rejection email
        try {
          const merchantEmail = merchantData?.pi_username || 'support@droppay.space';
          await supabase.functions.invoke('send-withdrawal-email', {
            body: {
              withdrawalId,
              merchantEmail,
              merchantName: merchantData?.business_name || merchantData?.pi_username,
              withdrawalAmount: withdrawal.amount,
              netAmount: 0,
              platformFee: 0,
              status: 'rejected',
              destination: 'N/A',
            },
          });
        } catch (emailError) {
          console.error('Error sending withdrawal rejection email:', emailError);
          // Don't fail the whole process if email fails
        }
      }

      toast.success('Withdrawal rejected');
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast.error('Failed to reject withdrawal');
    } finally {
      setIsProcessing(null);
    }
  };

  const openApproveDialog = (withdrawal: PendingWithdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setApproveTxInput('');
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;
    setApproveDialogOpen(false);
    await handleApprove(selectedWithdrawal, approveTxInput);
    setSelectedWithdrawal(null);
    setApproveTxInput('');
  };

  // Removed unused handleManualPayment helper to avoid type errors

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin: Withdrawals</h1>
          <p className="text-muted-foreground mt-1">
            Manage and approve merchant withdrawal requests
          </p>
        </div>

        {/* A2U Unavailable & Timing Note */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700">
            A2U is currently unavailable until Pi Network mainnet. Manual payouts only. Estimated arrival for manual payouts: {ESTIMATED_PAYOUT_TIME}. For delays or high volume, merchants can email support@droppay.space.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                π {stats.totalPendingAmount.toFixed(4)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Approved
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalApproved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                π {stats.totalApprovedAmount.toFixed(4)} processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platform Fees
              </CardTitle>
              <Wallet className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {stats.totalPlatformFeesAmount.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {stats.totalPlatformFees} withdrawals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Amount
              </CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {stats.totalPendingAmount.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Processed
              </CardTitle>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                π {stats.totalApprovedAmount.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
            <CardDescription>
              Review and process merchant withdrawal requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No withdrawal requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg bg-secondary/50 gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          @{withdrawal.pi_username || withdrawal.merchant?.pi_username || 'Unknown'}
                        </span>
                        <Badge variant={withdrawal.status === 'pending' ? 'outline' : withdrawal.status === 'completed' ? 'default' : 'destructive'}>
                          {withdrawal.status}
                        </Badge>
                        {withdrawal.merchant?.business_name && (
                          <span className="text-sm text-muted-foreground">
                            ({withdrawal.merchant.business_name})
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="font-medium text-foreground">π {Number(withdrawal.amount).toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Balance: </span>
                          <span className="font-medium text-foreground">
                            π {Number(withdrawal.merchant?.available_balance || 0).toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span className="text-foreground">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {withdrawal.status === 'pending' && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Withdrawal amount:</span>
                              <span className="font-medium">π {Number(withdrawal.amount).toFixed(7)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Platform fee (2% for maintenance & future features):</span>
                              <span className="font-medium text-amber-600">-π {(Number(withdrawal.amount) * PLATFORM_FEE_RATE).toFixed(7)}</span>
                            </div>
                            <div className="flex justify-between border-t border-amber-500/20 pt-1 mt-1">
                              <span className="font-semibold">Send to merchant:</span>
                              <span className="font-bold text-foreground">π {(Number(withdrawal.amount) - (Number(withdrawal.amount) * PLATFORM_FEE_RATE)).toFixed(7)}</span>
                            </div>
                            <p className="text-[10px] text-amber-700/70 mt-1.5 italic">
                              Platform fees (2%) support maintenance, security, and enable future features.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Manual Withdrawal - Shows wallet address with copy & QR */}
                      {withdrawal.wallet_address && withdrawal.withdrawal_type === 'manual' && (
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-medium">
                              Manual Withdrawal
                            </span>
                            <span className="text-xs text-muted-foreground">User manually typed wallet address</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground">Wallet Address:</span>
                            <code className="text-xs bg-background px-2 py-1 rounded font-mono flex-1 break-all">
                              {withdrawal.wallet_address}
                            </code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(withdrawal.wallet_address || '');
                                toast.success('Wallet address copied to clipboard!');
                              }}
                              className="h-7"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWalletAddress(withdrawal.wallet_address || '');
                                setSelectedAmount(Number(withdrawal.amount));
                                setQrDialogOpen(true);
                              }}
                              className="h-7"
                            >
                              <QrCode className="w-3 h-3 mr-1" />
                              QR Code
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* A2U Withdrawal - Uses Pi authentication */}
                      {(!withdrawal.wallet_address || withdrawal.withdrawal_type === 'a2u') && withdrawal.pi_username && (
                        <div className="text-sm space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 font-medium">
                              A2U (App-to-User)
                            </span>
                            <span className="text-xs text-muted-foreground">Pi authenticated - send directly to username</span>
                          </div>
                          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Send payment to:</p>
                            <p className="text-base font-semibold text-green-600">@{withdrawal.pi_username}</p>
                            <p className="text-xs text-muted-foreground mt-1">Use Pi wallet app to send directly to this username</p>
                            <p className="text-xs text-amber-700 mt-2">Note: A2U is not available until Pi Network mainnet. Process this as a manual payout. Estimated arrival: {ESTIMATED_PAYOUT_TIME}.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {withdrawal.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(withdrawal)}
                          disabled={isProcessing === withdrawal.id}
                        >
                          {isProcessing === withdrawal.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(withdrawal.id)}
                          disabled={isProcessing === withdrawal.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {withdrawal.status === 'completed' && withdrawal.wallet_address && (
                      <a
                        href={`https://blockexplorer.minepi.com/mainnet/address/${withdrawal.wallet_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Wallet
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code to Send Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG
                value={selectedWalletAddress}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Amount to Send</p>
                <p className="text-xl font-bold text-foreground">π {selectedAmount.toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                <code className="text-xs font-mono break-all text-foreground">{selectedWalletAddress}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(selectedWalletAddress);
                  toast.success('Wallet address copied!');
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
              <Button
                className="flex-1"
                onClick={() => setQrDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Withdrawal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedWithdrawal && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-base font-semibold text-foreground">π {Number(selectedWithdrawal.amount).toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">Platform Fee (2% for maintenance & future features)</p>
                  <p className="text-base font-semibold text-foreground">π {(Number(selectedWithdrawal.amount) * PLATFORM_FEE_RATE).toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Net To Send</p>
                  <p className="text-base font-semibold text-foreground">π {(Number(selectedWithdrawal.amount) - (Number(selectedWithdrawal.amount) * PLATFORM_FEE_RATE)).toFixed(4)}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Optionally paste the Pi transaction link or ID. If left empty, approval will be recorded without a transaction reference.
            </p>
            <div className="space-y-2">
              <Label htmlFor="txlink">Transaction Link or ID</Label>
              <Input
                id="txlink"
                placeholder="https://blockexplorer.minepi.com/tx/… or TX ID"
                value={approveTxInput}
                onChange={(e) => setApproveTxInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={confirmApprove}>Confirm & Approve</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
