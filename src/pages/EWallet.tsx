import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Wallet, Copy, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EWalletTransfer {
  id: string;
  sender_merchant_id: string;
  receiver_merchant_id: string;
  sender_pi_username: string;
  receiver_pi_username: string;
  amount: number;
  note: string | null;
  status: string;
  created_at: string;
}

export default function EWallet() {
  const { merchant, piUser, isAuthenticated, isLoading } = useAuth();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [transfers, setTransfers] = useState<EWalletTransfer[]>([]);
  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canSend = useMemo(() => {
    const parsedAmount = Number(amount);
    return (
      !!merchant?.id &&
      !!piUser?.username &&
      !!piUser?.uid &&
      receiverUsername.trim().length > 0 &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      parsedAmount <= availableBalance
    );
  }, [amount, availableBalance, merchant?.id, piUser?.uid, piUser?.username, receiverUsername]);

  const refreshData = async () => {
    if (!merchant?.id || !piUser?.username || !piUser?.uid) return;

    setIsRefreshing(true);
    try {
      const [balanceResult, transfersResult] = await Promise.all([
        supabase
          .from('merchants')
          .select('available_balance')
          .eq('id', merchant.id)
          .maybeSingle(),
        (supabase as any).rpc('get_ewallet_transfers_for_merchant', {
          merchant_uuid: merchant.id,
          pi_username_input: piUser.username,
          pi_user_id_input: piUser.uid,
          limit_rows: 100,
        }),
      ]);

      if (balanceResult.error) {
        throw balanceResult.error;
      }
      setAvailableBalance(Number(balanceResult.data?.available_balance || 0));

      if (transfersResult.error) {
        throw transfersResult.error;
      }
      setTransfers((transfersResult.data || []) as EWalletTransfer[]);
    } catch (error: any) {
      console.error('Failed to load eWallet data:', error);
      toast.error(error?.message || 'Failed to load eWallet data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (merchant?.id && piUser?.username && piUser?.uid) {
      refreshData();
    }
  }, [merchant?.id, piUser?.username, piUser?.uid]);

  const handleSend = async () => {
    if (!merchant?.id || !piUser?.username || !piUser?.uid) {
      toast.error('Please sign in again to continue');
      return;
    }

    const normalizedReceiver = receiverUsername.replace(/^@/, '').trim();
    const parsedAmount = Number(amount);

    if (!normalizedReceiver) {
      toast.error('Enter receiver Pi username');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (parsedAmount > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc('transfer_ewallet_by_username', {
        sender_merchant_uuid: merchant.id,
        sender_pi_username_input: piUser.username,
        sender_pi_user_id_input: piUser.uid,
        receiver_pi_username_input: normalizedReceiver,
        transfer_amount: parsedAmount,
        transfer_note: note.trim() || null,
      });

      if (error) throw error;
      if (!data?.success) throw new Error('Transfer failed');

      toast.success(`Sent ${parsedAmount.toFixed(7)} Pi to @${normalizedReceiver}`);
      setReceiverUsername('');
      setAmount('');
      setNote('');
      await refreshData();
    } catch (error: any) {
      console.error('eWallet transfer failed:', error);
      toast.error(error?.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyUsername = async () => {
    if (!piUser?.username) return;
    await navigator.clipboard.writeText(`@${piUser.username}`);
    toast.success('Username copied');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">eWallet</h1>
            <p className="text-muted-foreground">Send and receive Pi by username.</p>
          </div>
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Available Balance</CardDescription>
              <CardTitle className="text-3xl">Pi {availableBalance.toFixed(7)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Wallet className="w-4 h-4 mr-2" />
                Ready for send/receive
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receive Money</CardDescription>
              <CardTitle className="text-xl">@{piUser?.username || 'unknown'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={copyUsername}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Username
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
            <CardDescription>Transfer instantly to another DropPay user via Pi username.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiver">Receiver Username</Label>
                <Input
                  id="receiver"
                  placeholder="@username"
                  value={receiverUsername}
                  onChange={(e) => setReceiverUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Pi)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.0000001"
                  placeholder="0.0000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                placeholder="Rent, refund, gift..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button onClick={handleSend} disabled={!canSend || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last eWallet transfers for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {transfers.length === 0 ? (
              <p className="text-muted-foreground">No transfers yet.</p>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => {
                  const isSent = transfer.sender_merchant_id === merchant?.id;
                  return (
                    <div key={transfer.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isSent ? <ArrowUpRight className="w-4 h-4 text-red-500" /> : <ArrowDownLeft className="w-4 h-4 text-green-600" />}
                          <p className="font-medium truncate">
                            {isSent ? `To @${transfer.receiver_pi_username}` : `From @${transfer.sender_pi_username}`}
                          </p>
                          <Badge variant={isSent ? 'destructive' : 'default'}>
                            {isSent ? 'Sent' : 'Received'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transfer.created_at).toLocaleString()}
                          {transfer.note ? ` • ${transfer.note}` : ''}
                        </p>
                      </div>
                      <p className={`font-semibold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                        {isSent ? '-' : '+'}Pi {Number(transfer.amount).toFixed(7)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
