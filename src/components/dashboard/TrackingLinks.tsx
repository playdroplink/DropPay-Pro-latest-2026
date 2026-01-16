import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Copy, ExternalLink, Trash2, BarChart3, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TrackingLink {
  id: string;
  name: string;
  slug: string;
  destination_url: string;
  tracking_code?: string;
  is_active: boolean;
  visits: number;
  conversions: number;
  created_at: string;
}

export function TrackingLinks() {
  const { merchant } = useAuth();
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    destination_url: '',
    tracking_code: '',
  });

  useEffect(() => {
    if (merchant) {
      fetchLinks();
    }
  }, [merchant]);

  const fetchLinks = async () => {
    if (!merchant) return;

    try {
      const { data, error } = await (supabase as any)
        .from('tracking_links')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching tracking links:', error);
    }
  };

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleCreateLink = async () => {
    if (!merchant || !formData.name || !formData.destination_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await (supabase as any).from('tracking_links').insert({
        merchant_id: merchant.id,
        name: formData.name,
        slug: generateSlug(),
        destination_url: formData.destination_url,
        tracking_code: formData.tracking_code || null,
      });

      if (error) throw error;

      toast.success('Tracking link created!');
      setIsDialogOpen(false);
      setFormData({ name: '', destination_url: '', tracking_code: '' });
      fetchLinks();
    } catch (error) {
      console.error('Error creating tracking link:', error);
      toast.error('Failed to create tracking link');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/track/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('tracking_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tracking link deleted');
      fetchLinks();
    } catch (error) {
      console.error('Error deleting tracking link:', error);
      toast.error('Failed to delete tracking link');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tracking Links</h2>
          <p className="text-muted-foreground">Create links for affiliate marketing and analytics</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Tracking Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tracking Link</DialogTitle>
              <DialogDescription>
                Create a trackable link to monitor visits and conversions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Link Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Instagram Campaign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination URL *</Label>
                <Input
                  id="destination"
                  placeholder="https://example.com"
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_code">Tracking Code (Optional)</Label>
                <Input
                  id="tracking_code"
                  placeholder="e.g., SUMMER2024"
                  value={formData.tracking_code}
                  onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
                />
              </div>
              <Button
                onClick={handleCreateLink}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {links.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tracking links yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first tracking link to start monitoring performance
              </p>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{link.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {link.destination_url}
                    </CardDescription>
                  </div>
                  {link.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{link.visits}</span>
                    <span className="text-muted-foreground">visits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{link.conversions}</span>
                    <span className="text-muted-foreground">conversions</span>
                  </div>
                  {link.conversions > 0 && link.visits > 0 && (
                    <Badge variant="outline">
                      {((link.conversions / link.visits) * 100).toFixed(1)}% rate
                    </Badge>
                  )}
                </div>

                {link.tracking_code && (
                  <div className="p-2 rounded bg-secondary/50 text-sm">
                    <span className="text-muted-foreground">Code:</span> <code className="font-mono">{link.tracking_code}</code>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/track/${link.slug}`}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(link.slug)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/track/${link.slug}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteLink(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
