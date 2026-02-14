import { useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Wallet, Copy, Send, Loader2, QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const TOP_UP_MIN = 1;
const TOP_UP_MAX = 1000000;
const QR_PREFIX = 'droppay://wallet';

export default function EWallet() {
  const { merchant, piUser, isAuthenticated, isLoading, isPiBrowser } = useAuth();
  const [resolvedMerchantId, setResolvedMerchantId] = useState<string | null>(merchant?.id || null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [revenueBalance, setRevenueBalance] = useState(0);
  const [transfers, setTransfers] = useState<EWalletTransfer[]>([]);
  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [moveAmount, setMoveAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTopUpProcessing, setIsTopUpProcessing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScannerStarting, setIsScannerStarting] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scannerTimerRef = useRef<number | null>(null);

  const canSend = useMemo(() => {
    const parsedAmount = Number(amount);
    return (
      !!(merchant?.id || resolvedMerchantId) &&
      !!piUser?.username &&
      !!piUser?.uid &&
      receiverUsername.trim().length > 0 &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      parsedAmount <= availableBalance
    );
  }, [amount, availableBalance, merchant?.id, piUser?.uid, piUser?.username, receiverUsername, resolvedMerchantId]);

  const canTopUp = useMemo(() => {
    const parsedTopUp = Number(topUpAmount);
    return (
      Number.isFinite(parsedTopUp) &&
      parsedTopUp >= TOP_UP_MIN &&
      parsedTopUp <= TOP_UP_MAX
    );
  }, [topUpAmount]);

  const resolveMerchantId = async (): Promise<string | null> => {
    if (merchant?.id) return merchant.id;
    if (resolvedMerchantId) return resolvedMerchantId;
    if (!piUser?.uid && !piUser?.username) return null;

    try {
      if (piUser?.uid) {
        const { data } = await supabase
          .from('merchants')
          .select('id')
          .eq('pi_user_id', piUser.uid)
          .limit(1)
          .maybeSingle();
        if (data?.id) {
          setResolvedMerchantId(data.id);
          return data.id;
        }
      }

      if (piUser?.username) {
        const normalizedUsername = piUser.username.replace(/^@/, '').trim();
        const { data } = await supabase
          .from('merchants')
          .select('id')
          .ilike('pi_username', normalizedUsername)
          .limit(1)
          .maybeSingle();
        if (data?.id) {
          setResolvedMerchantId(data.id);
          return data.id;
        }
      }

      if (piUser?.uid && piUser?.username) {
        const normalizedUsername = piUser.username.replace(/^@/, '').trim();
        const { data } = await supabase
          .from('merchants')
          .insert({
            pi_user_id: piUser.uid,
            pi_username: normalizedUsername,
            wallet_address: piUser.wallet_address,
          })
          .select('id')
          .single();
        if (data?.id) {
          setResolvedMerchantId(data.id);
          return data.id;
        }
      }
    } catch (error) {
      console.error('Failed to resolve merchant ID:', error);
    }

    return null;
  };

  const refreshData = async () => {
    if (!piUser?.username || !piUser?.uid) return;
    const merchantId = await resolveMerchantId();
    if (!merchantId) return;

    setIsRefreshing(true);
    try {
      const [balanceResult, transfersResult] = await Promise.all([
        supabase
          .from('merchants')
          .select('available_balance, revenue_balance')
          .eq('id', merchantId)
          .maybeSingle(),
        (supabase as any).rpc('get_ewallet_transfers_for_merchant', {
          merchant_uuid: merchantId,
          pi_username_input: piUser.username,
          pi_user_id_input: piUser.uid,
          limit_rows: 100,
        }),
      ]);

      if (balanceResult.error) {
        throw balanceResult.error;
      }
      setAvailableBalance(Number(balanceResult.data?.available_balance || 0));
      setRevenueBalance(Number((balanceResult.data as any)?.revenue_balance || 0));

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
    if (merchant?.id) {
      setResolvedMerchantId(merchant.id);
    }
    if (piUser?.username && piUser?.uid) {
      refreshData();
    }
  }, [merchant?.id, piUser?.username, piUser?.uid]);

  const handleSend = async () => {
    const merchantId = await resolveMerchantId();
    if (!merchantId || !piUser?.username || !piUser?.uid) {
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
        sender_merchant_uuid: merchantId,
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

  const getReceiveQrPayload = () => {
    const user = (piUser?.username || '').replace(/^@/, '');
    if (!user) return '';
    return `${QR_PREFIX}?u=${encodeURIComponent(user)}`;
  };

  const stopScanner = () => {
    if (scannerTimerRef.current) {
      window.clearInterval(scannerTimerRef.current);
      scannerTimerRef.current = null;
    }
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((t) => t.stop());
      scannerStreamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  const parseScannedQr = (raw: string) => {
    const value = (raw || '').trim();
    if (!value) return false;

    try {
      if (value.startsWith(QR_PREFIX)) {
        const url = new URL(value.replace(QR_PREFIX, 'https://droppay.wallet'));
        const u = (url.searchParams.get('u') || '').replace(/^@/, '');
        const a = url.searchParams.get('a');
        const n = url.searchParams.get('n');
        if (u) setReceiverUsername(u);
        if (a && Number(a) > 0) setAmount(String(Number(a)));
        if (n) setNote(n);
        return !!u;
      }

      if (value.startsWith('{')) {
        const parsed = JSON.parse(value);
        const u = String(parsed?.u || parsed?.username || '').replace(/^@/, '');
        const a = parsed?.a ?? parsed?.amount;
        const n = parsed?.n ?? parsed?.note;
        if (u) setReceiverUsername(u);
        if (a && Number(a) > 0) setAmount(String(Number(a)));
        if (n) setNote(String(n));
        return !!u;
      }
    } catch {
      return false;
    }

    return false;
  };

  const startScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      return;
    }

    setIsScannerStarting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      scannerStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      scannerTimerRef.current = window.setInterval(async () => {
        try {
          if (!videoRef.current) return;
          const codes = await detector.detect(videoRef.current);
          if (!codes || codes.length === 0) return;
          const raw = codes[0]?.rawValue || '';
          if (!raw) return;

          const parsed = parseScannedQr(raw);
          if (parsed) {
            toast.success('QR scanned and applied to Express Send');
            stopScanner();
          } else {
            toast.error('Invalid wallet QR code');
          }
        } catch {
          // ignore transient detect errors
        }
      }, 500);
    } catch (error: any) {
      console.error('Failed to start QR scanner:', error);
      toast.error(error?.message || 'Failed to access camera for QR scanning');
      stopScanner();
    } finally {
      setIsScannerStarting(false);
    }
  };

  const openScannerModal = async () => {
    setIsScannerOpen(true);
    if (!('BarcodeDetector' in window)) {
      toast.info('Camera QR scan is not supported here. Use paste/manual QR below.');
      return;
    }
    await startScanner();
  };

  const applyScannerInput = () => {
    if (!scannerInput.trim()) {
      toast.error('Paste or enter QR data first');
      return;
    }
    const parsed = parseScannedQr(scannerInput);
    if (parsed) {
      toast.success('QR data applied to Express Send');
      setScannerInput('');
      stopScanner();
    } else {
      toast.error('Invalid wallet QR data');
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setScannerInput(text || '');
      if (!text) {
        toast.error('Clipboard is empty');
      }
    } catch {
      toast.error('Clipboard access blocked. Paste manually.');
    }
  };

  const handleTopUp = async () => {
    const merchantId = await resolveMerchantId();
    if (!merchantId || !piUser?.username || !piUser?.uid) {
      toast.error('Please sign in again to continue');
      return;
    }

    if (!isPiBrowser || !(window as any).Pi) {
      toast.error('Please open in Pi Browser to top up wallet');
      return;
    }

    const parsedTopUpAmount = Number(topUpAmount);
    if (!Number.isFinite(parsedTopUpAmount) || parsedTopUpAmount < TOP_UP_MIN) {
      toast.error(`Minimum top up is ${TOP_UP_MIN} Pi`);
      return;
    }
    if (parsedTopUpAmount > TOP_UP_MAX) {
      toast.error(`Maximum top up per payment is ${TOP_UP_MAX.toLocaleString()} Pi`);
      return;
    }

    const Pi = (window as any).Pi;
    setIsTopUpProcessing(true);
    let topUpTimeout: number | null = null;

    const clearTopUpTimeout = () => {
      if (topUpTimeout) {
        window.clearTimeout(topUpTimeout);
        topUpTimeout = null;
      }
    };

    try {
      await Pi.init({ version: '2.0', sandbox: false });

      topUpTimeout = window.setTimeout(() => {
        setIsTopUpProcessing(false);
        toast.error('Top up timed out. Please try again.');
      }, 120000);

      // Pi SDK createPayment is callback-based (not a promise in all runtimes).
      Pi.createPayment(
        {
          amount: parsedTopUpAmount,
          memo: `Wallet Top Up - ${parsedTopUpAmount} Credits`,
          metadata: {
            type: 'wallet_topup',
            merchant_id: merchantId,
            pi_username: piUser.username,
            credits: parsedTopUpAmount,
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              const approval = await supabase.functions.invoke('approve-payment', {
                body: { paymentId },
              });
              if (approval.error) throw approval.error;
            } catch (error: any) {
              clearTopUpTimeout();
              setIsTopUpProcessing(false);
              throw error;
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              const completion = await supabase.functions.invoke('complete-payment', {
                body: {
                  paymentId,
                  txid,
                  payerUsername: piUser.username,
                  merchantId: merchantId,
                  paymentType: 'wallet_topup',
                  amount: parsedTopUpAmount,
                },
              });

              if (completion.error) throw completion.error;

              const { data, error } = await (supabase as any).rpc('topup_wallet_credit', {
                merchant_uuid: merchantId,
                pi_username_input: piUser.username,
                pi_user_id_input: piUser.uid,
                topup_amount: parsedTopUpAmount,
                payment_id: paymentId,
                payment_txid: txid,
              });

              if (error) throw error;
              if (!data?.success) throw new Error('Top up crediting failed');

              toast.success(`Top up successful: ${parsedTopUpAmount.toFixed(7)} credits added`);
              setTopUpAmount('');
              await refreshData();
              clearTopUpTimeout();
              setIsTopUpProcessing(false);
            } catch (error: any) {
              clearTopUpTimeout();
              console.error('Top up completion error:', error);
              toast.error(error?.message || 'Top up failed');
              setIsTopUpProcessing(false);
            }
          },
          onCancel: () => {
            clearTopUpTimeout();
            toast.info('Top up cancelled');
            setIsTopUpProcessing(false);
          },
          onError: (error: any) => {
            clearTopUpTimeout();
            console.error('Top up payment error:', error);
            toast.error(error?.message || 'Top up failed');
            setIsTopUpProcessing(false);
          },
        }
      );
    } catch (error: any) {
      clearTopUpTimeout();
      console.error('Top up failed:', error);
      toast.error(error?.message || 'Top up failed');
      setIsTopUpProcessing(false);
    }
  };

  const handleMove = async (direction: 'revenue_to_wallet' | 'wallet_to_revenue') => {
    const merchantId = await resolveMerchantId();
    if (!merchantId || !piUser?.username || !piUser?.uid) {
      toast.error('Please sign in again to continue');
      return;
    }

    const parsedMoveAmount = Number(moveAmount);
    if (!Number.isFinite(parsedMoveAmount) || parsedMoveAmount <= 0) {
      toast.error('Enter a valid move amount');
      return;
    }

    setIsMoving(true);
    try {
      const { data, error } = await (supabase as any).rpc('move_revenue_wallet_balance', {
        merchant_uuid: merchantId,
        pi_username_input: piUser.username,
        pi_user_id_input: piUser.uid,
        move_amount: parsedMoveAmount,
        move_direction: direction,
      });

      if (error) throw error;
      if (!data?.success) throw new Error('Move failed');

      toast.success(direction === 'revenue_to_wallet'
        ? 'Moved from Revenue to Wallet'
        : 'Moved from Wallet to Revenue');
      setMoveAmount('');
      await refreshData();
    } catch (error: any) {
      console.error('Move balance failed:', error);
      toast.error(error?.message || 'Move failed');
    } finally {
      setIsMoving(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

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
            <h1 className="text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">eWallet: send, receive, and top up credits by Pi username.</p>
          </div>
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Wallet Balance</CardDescription>
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
              <CardDescription>Revenue Balance</CardDescription>
              <CardTitle className="text-3xl">Pi {revenueBalance.toFixed(7)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Wallet className="w-4 h-4 mr-2" />
                Movable from dashboard revenue
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receive Pi</CardDescription>
              <CardTitle className="text-xl">@{piUser?.username || 'unknown'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center p-3 rounded-lg border bg-white">
                <QRCodeSVG value={getReceiveQrPayload()} size={156} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyUsername} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Username
                </Button>
                <Button variant="outline" onClick={openScannerModal} disabled={isScannerStarting} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Move Balance</CardTitle>
              <CardDescription>Move funds between Revenue and Wallet (both directions).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="moveAmount">Amount (Pi)</Label>
                <Input
                  id="moveAmount"
                  type="number"
                  min="0"
                  step="0.0000001"
                  placeholder="0.0000000"
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleMove('revenue_to_wallet')}
                  disabled={isMoving}
                >
                  Revenue to Wallet
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleMove('wallet_to_revenue')}
                  disabled={isMoving}
                >
                  Wallet to Revenue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Up Credits</CardTitle>
            <CardDescription>Buy credits for wallet balance via Pi payment. 1 Pi = 1 Credit. Min 1 Pi, max 1,000,000 Pi per top up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topup">Top Up Amount (Pi)</Label>
                <Input
                  id="topup"
                  type="number"
                  min={String(TOP_UP_MIN)}
                  max={String(TOP_UP_MAX)}
                  step="0.0000001"
                  placeholder="1.0000000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Credits You Get</Label>
                <Input value={Number(topUpAmount || 0).toFixed(7)} readOnly />
              </div>
            </div>
            <Button onClick={handleTopUp} disabled={!canTopUp || isTopUpProcessing}>
              {isTopUpProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
              Top Up
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Express Send</CardTitle>
            <CardDescription>Transfer instantly by username or scan wallet QR code.</CardDescription>
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
              Express Send
            </Button>
          </CardContent>
        </Card>

        <Dialog
          open={isScannerOpen}
          onOpenChange={(open) => {
            if (!open) {
              stopScanner();
            } else {
              setIsScannerOpen(true);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Scan Wallet QR
              </DialogTitle>
              <DialogDescription>
                Scan with camera, or paste QR payload for devices without camera scanning.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {'BarcodeDetector' in window ? (
                <video ref={videoRef} className="w-full rounded-lg border bg-black" autoPlay muted playsInline />
              ) : (
                <div className="p-3 rounded-lg border text-sm text-muted-foreground">
                  Camera QR scanning not available on this device/browser.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="qrManual">QR Data</Label>
                <Input
                  id="qrManual"
                  placeholder="droppay://wallet?u=username&a=10&n=note"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={pasteFromClipboard}>Paste</Button>
                <Button onClick={applyScannerInput}>Apply QR</Button>
                <Button variant="outline" onClick={stopScanner}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last wallet transfers for your account.</CardDescription>
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
