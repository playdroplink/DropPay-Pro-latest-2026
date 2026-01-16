import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

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

interface AnalyticsChartsProps {
  revenueData: RevenueData[];
  linkPerformance: LinkPerformance[];
  paymentTypeDistribution: { name: string; value: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export function AnalyticsCharts({ revenueData, linkPerformance, paymentTypeDistribution }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Over Time */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (π)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No revenue data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="transactions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No transaction data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {paymentTypeDistribution.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No payment type data yet
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {paymentTypeDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Link Performance */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Payment Link Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {linkPerformance.length > 0 ? (
            <div className="space-y-4">
              {linkPerformance.map((link) => (
                <div key={link.title} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{link.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.views} views • {link.conversions} conversions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">π {link.revenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {link.views > 0 ? ((link.conversions / link.views) * 100).toFixed(1) : 0}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payment link data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
