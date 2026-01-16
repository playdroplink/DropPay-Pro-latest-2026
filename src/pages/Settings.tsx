import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Settings() {
  const { isAuthenticated, isLoading, merchant, piUser } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.business_name || '');
      setWalletAddress((merchant as any).wallet_address || '');
    }
  }, [merchant]);

  const handleSave = async () => {
    if (!merchant) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ 
          business_name: businessName,
          wallet_address: walletAddress || null,
        })
        .eq('id', merchant.id);

      if (error) throw error;
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and business settings
          </p>
        </div>

        {/* Wallet Setup */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <CardTitle>Wallet Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your Pi wallet address to receive payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!walletAddress && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Set your wallet address to enable blockchain verification and receive payments directly to your wallet.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Pi Wallet Address</Label>
              <Input
                id="walletAddress"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your Pi mainnet wallet address where you'll receive payments. This is used to verify transactions on the blockchain.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your Pi Network account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pi Username</Label>
              <Input value={`@${piUser?.username || ''}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Pi User ID</Label>
              <Input value={piUser?.uid || ''} disabled className="font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
            <CardDescription>Customize your merchant profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on your payment pages and receipts
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle>Embed Checkout Widget</CardTitle>
            <CardDescription>
              Add this code to your website to embed the DropPay checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground text-sm overflow-x-auto">
{`<script src="${window.location.origin}/embed.js"></script>
<div id="droppay-checkout" 
     data-merchant="${merchant?.id}"
     data-amount="10.00"
     data-title="Your Product">
</div>`}
            </pre>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(
                  `<script src="${window.location.origin}/embed.js"></script>\n<div id="droppay-checkout" data-merchant="${merchant?.id}" data-amount="10.00" data-title="Your Product"></div>`
                );
                toast.success('Embed code copied!');
              }}
            >
              Copy Embed Code
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account, plan, and all created links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700">
                Deleting your account will remove your subscription/plan, all payment links, tracking links, transactions, withdrawals, notifications, and platform fees (collected for maintenance & future features) associated with your merchant. This action cannot be undone.
              </p>
            </div>
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This will permanently delete your merchant account, plan, and all links you created. Type DELETE to confirm.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Label htmlFor="deleteConfirm">Type DELETE to confirm</Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="DELETE"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We will remove: plan/subscription, payment links, tracking links, tracking events, transactions, withdrawals, withdrawal requests, notifications, platform fees (collected for maintenance & future features), and your merchant profile.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    onClick={async () => {
                      if (!merchant) return;
                      setIsDeleting(true);
                      try {
                        const mid = merchant.id;
                        // Delete related data in dependency-safe order to avoid FK violations
                        const steps = [
                          { table: 'tracking_events', typed: false },
                          { table: 'tracking_links', typed: false },
                          { table: 'api_keys', typed: false },
                          { table: 'webhooks', typed: false },
                          { table: 'ad_rewards', typed: false },
                          { table: 'platform_fees', typed: true },
                          { table: 'transactions', typed: true },
                          { table: 'withdrawal_requests', typed: false },
                          { table: 'withdrawals', typed: true },
                          { table: 'notifications', typed: true },
                          { table: 'user_subscriptions', typed: false },
                          { table: 'payment_links', typed: true },
                        ] as const;

                        for (const step of steps) {
                          const client = step.typed ? supabase : (supabase as any);
                          const resp = await client.from(step.table).delete().eq('merchant_id', mid);
                          if (resp.error) {
                            throw new Error(`${step.table}: ${resp.error.message}`);
                          }
                        }

                        // Finally delete merchant profile
                        const { error: mErr } = await supabase
                          .from('merchants')
                          .delete()
                          .eq('id', mid);
                        if (mErr) throw mErr;

                        // Also delete the Supabase Auth user via Edge Function
                        try {
                          if (piUser?.uid) {
                            await supabase.functions.invoke('delete-account', {
                              body: { user_id: piUser.uid },
                            });
                          }
                        } catch (e) {
                          // Swallow function invocation errors to prevent noisy console output
                          console.warn('delete-account function invocation skipped or failed:', e);
                        }

                        toast.success('Your account has been deleted.');
                        setIsDeleteOpen(false);
                        // Logout and redirect
                        try {
                          // Clear local session
                          localStorage.removeItem('pi_user');
                          localStorage.removeItem('pi_access_token');
                        } catch {}
                        navigate('/auth');
                      } catch (err) {
                        console.error('Delete account error:', err);
                        toast.error('Failed to delete account. Please try again or contact support@droppay.space');
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
