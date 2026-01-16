import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface StoreItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  slug: string;
  pricing_type?: string;
  show_on_store?: boolean;
  is_active?: boolean;
}

export default function Storefront() {
  const { merchant, isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (merchant) {
      loadStoreItems();
    }
  }, [merchant]);

  const loadStoreItems = async () => {
    if (!merchant) return;
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('payment_links')
        .select('id, title, description, amount, slug, pricing_type, show_on_store, is_active')
        .eq('merchant_id', merchant.id)
        .eq('show_on_store', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading store items:', error);
      toast.error('Could not load store items');
    } finally {
      setIsFetching(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Store link copied');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading store...</div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">Sign in to manage your store</p>
            <p className="text-sm text-muted-foreground">Login with Pi to view and share your store items.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Store</h1>
            <p className="text-muted-foreground mt-1">Links you marked as "Show on store" appear here for quick sharing.</p>
          </div>
          <Button onClick={loadStoreItems} variant="outline" disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-semibold">No store items yet</p>
              <p className="text-sm text-muted-foreground">Mark a payment link as "Show on store" to display it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const priceLabel = item.pricing_type === 'free' ? 'Free' : `π ${item.amount ?? 0}`;
              const payUrl = `/pay/${item.slug}`;
              return (
                <Card key={item.id} className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div className="text-xl font-semibold">{priceLabel}</div>
                    <div className="flex gap-2 mt-auto">
                      <Button asChild variant="secondary" className="flex-1">
                        <a href={payUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> View
                        </a>
                      </Button>
                      <Button variant="outline" onClick={() => copyLink(item.slug)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
