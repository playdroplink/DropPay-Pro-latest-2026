import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const HORIZON_URL = 'https://api.mainnet.minepi.com';
const REQUEST_TIMEOUT = 10000;
const SLEEP_BETWEEN_PAGES = 100; // milliseconds

interface Transaction {
  id: string;
  pi_payment_id: string;
  payer_pi_username: string | null;
  amount: number;
  status: string;
  memo: string | null;
  created_at: string;
  completed_at: string | null;
  payment_links: {
    title: string;
  } | null;
}

interface HorizonOperation {
  type: string;
  source: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  transaction_hash: string;
  date: string;
}

export default function Transactions() {
  const { isAuthenticated, isLoading, merchant } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [horizonOps, setHorizonOps] = useState<HorizonOperation[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isFetchingHorizon, setIsFetchingHorizon] = useState(false);
  const [activeTab, setActiveTab] = useState<'droppay' | 'horizon'>('droppay');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (merchant) {
      fetchTransactions();
    }
  }, [merchant]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, statusFilter]);

  const fetchTransactions = async () => {
    if (!merchant) return;

    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          payment_links (title)
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.payer_pi_username?.toLowerCase().includes(query) ||
          tx.pi_payment_id.toLowerCase().includes(query) ||
          tx.memo?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  // Pi Network Horizon Operations Fetching
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const horizonGet = async (url: string, params?: Record<string, any>) => {
    try {
      const urlObj = new URL(url);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
      }
      
      // Use AbortController for timeout instead of RequestInit timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      try {
        const response = await fetch(urlObj.toString(), { 
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Horizon API error:', error);
      throw error;
    }
  };

  const isoToUtc = (isoString: string): string => {
    try {
      return new Date(isoString).toISOString();
    } catch {
      return '';
    }
  };

  const opAssetString = (op: Record<string, any>): string => {
    const at = op.asset_type;
    if (!at) return '';
    if (at === 'native') return 'native';
    const code = op.asset_code || '';
    const issuer = op.asset_issuer || '';
    if (code && issuer) return `${code}:${issuer}`;
    return at;
  };

  const pick = (d: Record<string, any>, ...keys: string[]): string => {
    for (const key of keys) {
      if (d[key] !== undefined && d[key] !== null) {
        return String(d[key]);
      }
    }
    return '';
  };

  const fetchTxCreatedAt = async (txHash: string, cache: Map<string, string>): Promise<string> => {
    if (!txHash) return '';
    if (cache.has(txHash)) return cache.get(txHash) || '';
    
    try {
      const tx = await horizonGet(`${HORIZON_URL}/transactions/${txHash}`);
      const createdAt = tx.created_at || '';
      const utcDate = isoToUtc(createdAt);
      cache.set(txHash, utcDate);
      return utcDate;
    } catch {
      return '';
    }
  };

  const fetchHorizonOperations = async (piUsername: string) => {
    if (!piUsername) {
      toast.error('Pi username not found');
      return;
    }

    setIsFetchingHorizon(true);
    try {
      const url = `${HORIZON_URL}/accounts/${piUsername}/operations`;
      const params = { limit: 200, order: 'asc' };
      const ops: HorizonOperation[] = [];
      const txDateCache = new Map<string, string>();
      let pageNum = 0;
      let nextUrl = url;
      let nextParams: Record<string, any> | null = params;

      toast.loading('Fetching Pi Network operations...');

      while (true) {
        pageNum++;
        const data = await horizonGet(nextUrl, nextParams);
        const records: Record<string, any>[] = data._embedded?.records || [];

        if (!records.length) break;

        for (const op of records) {
          const createdAt = await fetchTxCreatedAt(pick(op, 'transaction_hash'), txDateCache);
          ops.push({
            type: pick(op, 'type'),
            source: pick(op, 'source_account'),
            from: pick(op, 'from', 'funder', 'source_account'),
            to: pick(op, 'to', 'account', 'created_account'),
            amount: pick(op, 'amount', 'starting_balance'),
            asset: opAssetString(op),
            transaction_hash: pick(op, 'transaction_hash'),
            date: createdAt,
          });
        }

        const links = data._links || {};
        const nextLink = links.next?.href;
        if (!nextLink) break;

        nextUrl = nextLink;
        nextParams = null;

        if (SLEEP_BETWEEN_PAGES > 0) {
          await sleep(SLEEP_BETWEEN_PAGES);
        }
      }

      setHorizonOps(ops);
      toast.success(`Loaded ${ops.length} operations from Pi Network`);
    } catch (error) {
      console.error('Error fetching Horizon operations:', error);
      toast.error('Failed to fetch Pi Network operations');
    } finally {
      setIsFetchingHorizon(false);
    }
  };

  const exportHorizonToCSV = () => {
    const headers = ['Date', 'Type', 'From', 'To', 'Amount', 'Asset', 'Transaction Hash'];
    const rows = horizonOps.map((op) => [
      op.date,
      op.type,
      op.from,
      op.to,
      op.amount,
      op.asset,
      op.transaction_hash,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pi-operations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Operations exported!');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Payment ID', 'Payer', 'Amount', 'Status', 'Memo'];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.created_at).toISOString(),
      tx.pi_payment_id,
      tx.payer_pi_username || 'Anonymous',
      tx.amount.toString(),
      tx.status,
      tx.memo || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Transactions exported!');
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your payment transactions
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'horizon' && (
              <Button 
                variant="outline" 
                onClick={exportHorizonToCSV}
                disabled={horizonOps.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            {activeTab === 'droppay' && (
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('droppay')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'droppay'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            DropPay Transactions
          </button>
          <button
            onClick={() => setActiveTab('horizon')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'horizon'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pi Network Operations
          </button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'droppay' ? 
                    'Search by username, payment ID, or memo...' : 
                    'Search by type, account, or hash...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === 'droppay' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {activeTab === 'horizon' && (
                <Button 
                  onClick={() => fetchHorizonOperations(merchant?.pi_username || '')}
                  disabled={isFetchingHorizon}
                  variant="default"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isFetchingHorizon ? 'animate-spin' : ''}`} />
                  {isFetchingHorizon ? 'Loading...' : 'Refresh'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'droppay' 
                ? `${filteredTransactions.length} Transaction${filteredTransactions.length !== 1 ? 's' : ''}`
                : `${horizonOps.length} Operation${horizonOps.length !== 1 ? 's' : ''}`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'droppay' ? (
              <>
                {isLoadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {transactions.length === 0
                      ? 'No transactions yet'
                      : 'No transactions match your filters'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Payer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Link</TableHead>
                          <TableHead>Payment ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleTimeString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {tx.payer_pi_username ? `@${tx.payer_pi_username}` : 'Anonymous'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              π {Number(tx.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  tx.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : tx.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {tx.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {tx.payment_links?.title || '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {tx.pi_payment_id.slice(0, 12)}...
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            ) : (
              <>
                {horizonOps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No operations loaded yet</p>
                    <p className="text-sm mt-2">Click "Refresh" to fetch your Pi Network operations</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Tx Hash</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {horizonOps.map((op, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="whitespace-nowrap text-xs">
                              {op.date ? new Date(op.date).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-sm font-medium">{op.type}</TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-xs">
                              {op.from || '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-xs">
                              {op.to || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {op.amount ? `${parseFloat(op.amount).toFixed(2)} π` : '-'}
                            </TableCell>
                            <TableCell className="text-sm">{op.asset || '-'}</TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-xs">
                              {op.transaction_hash?.slice(0, 12) || '-'}...
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}