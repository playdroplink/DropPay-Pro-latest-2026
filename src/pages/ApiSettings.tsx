import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Copy, Trash2, Key, Webhook, Code } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export default function ApiSettings() {
  const { isAuthenticated, isLoading, merchant } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (merchant) {
      fetchApiKeys();
      fetchWebhooks();
    }
  }, [merchant]);

  const fetchApiKeys = async () => {
    if (!merchant) return;

    try {
      const { data } = await supabase
        .from('api_keys')
        .select('id, key_prefix, name, is_active, created_at, last_used_at')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchWebhooks = async () => {
    if (!merchant) return;

    try {
      const { data } = await supabase
        .from('webhooks')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'dp_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const hashKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateApiKey = async () => {
    if (!merchant || !newKeyName) {
      toast.error('Please enter a key name');
      return;
    }

    try {
      const key = generateApiKey();
      const keyHash = await hashKey(key);
      const keyPrefix = key.slice(0, 12);

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          merchant_id: merchant.id,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          name: newKeyName,
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedKey(key);
      setApiKeys([{ ...data, key_prefix: keyPrefix }, ...apiKeys]);
      setNewKeyName('');
      toast.success('API key created! Copy it now - you won\'t see it again.');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      toast.success('API key deleted');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const generateWebhookSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 24; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const handleCreateWebhook = async () => {
    if (!merchant || !newWebhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          merchant_id: merchant.id,
          url: newWebhookUrl,
          secret: generateWebhookSecret(),
        })
        .select()
        .single();

      if (error) throw error;

      setWebhooks([data, ...webhooks]);
      setNewWebhookUrl('');
      setIsWebhookDialogOpen(false);
      toast.success('Webhook created!');
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast.error('Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', id);
      if (error) throw error;
      setWebhooks(webhooks.filter((w) => w.id !== id));
      toast.success('Webhook deleted');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast.error('Failed to delete webhook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">API & Webhooks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys and webhook configurations
          </p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-keys" className="gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <Code className="w-4 h-4" />
              Quick Start
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for programmatic access
                  </CardDescription>
                </div>
                <Dialog open={isKeyDialogOpen} onOpenChange={(open) => {
                  setIsKeyDialogOpen(open);
                  if (!open) setGeneratedKey('');
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {generatedKey ? 'API Key Created' : 'Create API Key'}
                      </DialogTitle>
                      <DialogDescription>
                        {generatedKey
                          ? 'Copy this key now. You won\'t be able to see it again.'
                          : 'Give your API key a name to identify it later'}
                      </DialogDescription>
                    </DialogHeader>
                    {generatedKey ? (
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-secondary font-mono text-sm break-all">
                          {generatedKey}
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => copyToClipboard(generatedKey)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Key
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="keyName">Key Name</Label>
                            <Input
                              id="keyName"
                              placeholder="e.g., Production API Key"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsKeyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateApiKey}>Create Key</Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys yet. Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{key.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {key.key_prefix}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteApiKey(key.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Receive real-time notifications when payments are completed
                  </CardDescription>
                </div>
                <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Webhook Endpoint</DialogTitle>
                      <DialogDescription>
                        Enter the URL where you want to receive webhook notifications
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Endpoint URL</Label>
                        <Input
                          id="webhookUrl"
                          type="url"
                          placeholder="https://your-server.com/webhook"
                          value={newWebhookUrl}
                          onChange={(e) => setNewWebhookUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsWebhookDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateWebhook}>Add Webhook</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {webhooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No webhooks configured. Add one to receive payment notifications.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div>
                          <p className="font-medium text-foreground font-mono text-sm">
                            {webhook.url}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Events: {webhook.events.join(', ')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Get started with the DropPay API in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. Authentication</h3>
                  <p className="text-muted-foreground mb-3">
                    Include your API key in the Authorization header:
                  </p>
                  <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground text-sm overflow-x-auto">
{`curl -H "Authorization: Bearer dp_live_your_api_key" \\
  https://api.droppay.io/v1/payments`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. Create a Payment</h3>
                  <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground text-sm overflow-x-auto">
{`curl -X POST https://api.droppay.io/v1/payments \\
  -H "Authorization: Bearer dp_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 10.00,
    "memo": "Product purchase",
    "metadata": { "order_id": "12345" }
  }'`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. Webhook Payload</h3>
                  <pre className="p-4 rounded-lg bg-sidebar text-sidebar-foreground text-sm overflow-x-auto">
{`{
  "event": "payment.completed",
  "data": {
    "id": "pay_abc123",
    "amount": 10.00,
    "status": "completed",
    "payer_username": "john_doe",
    "completed_at": "2024-01-15T10:30:00Z"
  }
}`}
                  </pre>
                </div>

                <Button variant="outline" asChild>
                  <a href="/docs" target="_blank">
                    View Full Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}