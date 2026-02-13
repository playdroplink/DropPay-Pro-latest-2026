import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { Crown, TrendingUp, Zap, ArrowUpRight, Calendar, Clock, RefreshCw, Star, Rocket, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const planIcons: Record<string, any> = {
  Free: Zap,
  Basic: Star,
  Growth: Rocket,
  Pro: Rocket,
  Enterprise: Building2,
};

export function SubscriptionStatus() {
  const { plan, subscription, linkCount, remainingLinks, isFreePlan, canCreateLink, daysUntilExpiry, isExpired } = useSubscription();

  if (!plan) return null;

  const linkLimit = plan.link_limit || Infinity;
  const usagePercent = linkLimit === Infinity ? 0 : (linkCount / linkLimit) * 100;
  const isNearLimit = usagePercent >= 80;
  const PlanIcon = planIcons[plan.name] || Crown;

  return (
    <Card className={`${isFreePlan ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background' : 'border-primary/20 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isFreePlan ? (
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PlanIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{plan.name} Plan</CardTitle>
              <CardDescription>
                {isFreePlan ? 'Limited features' : `Ï€ ${plan.amount}/month`}
              </CardDescription>
            </div>
          </div>
          {!isFreePlan && (
            <Badge 
              variant={isExpired ? 'destructive' : 'default'} 
              className={isExpired ? '' : 'bg-primary'}
            >
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Period Info */}
        {!isFreePlan && subscription && (
          <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
            {subscription.started_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Started:</span>
                <span className="font-medium">{format(new Date(subscription.started_at), 'MMM d, yyyy')}</span>
              </div>
            )}
            {subscription.expires_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Expires:</span>
                <span className={`font-medium ${isExpired ? 'text-destructive' : daysUntilExpiry && daysUntilExpiry <= 7 ? 'text-orange-500' : ''}`}>
                  {format(new Date(subscription.expires_at), 'MMM d, yyyy')}
                  {daysUntilExpiry !== null && !isExpired && (
                    <span className="text-muted-foreground ml-1">({daysUntilExpiry} days left)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment Links</span>
            <span className="font-medium">
              {linkCount} / {linkLimit === Infinity ? 'âˆž' : linkLimit}
            </span>
          </div>
          {linkLimit !== Infinity && (
            <>
              <Progress value={usagePercent} className={isNearLimit ? 'bg-orange-200' : ''} />
              {remainingLinks !== null && remainingLinks > 0 && (
                <p className="text-xs text-muted-foreground">
                  {remainingLinks} link{remainingLinks !== 1 ? 's' : ''} remaining
                </p>
              )}
            </>
          )}
        </div>

        {/* Platform Fee */}
        <div className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
          <span className="text-muted-foreground">Platform Fee</span>
          <span className="font-medium text-primary">{plan.platform_fee_percent}%</span>
        </div>

        {/* Free Plan Limits */}
        {isFreePlan && (
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-sm text-foreground mb-2">Free Plan Limits</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>â€¢ 2 payment links only</li>
              <li>â€¢ Basic features</li>
              <li>â€¢ 1% platform fee</li>
            </ul>
          </div>
        )}

        {/* Expired Plan - Renew CTA */}
        {!isFreePlan && isExpired && (
          <div className="pt-2">
            <Link to="/pricing">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Renew Plan
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Upgrade CTA */}
        {isFreePlan && (
          <div className="pt-2">
            <Link to="/pricing">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Active Paid Plan Features */}
        {!isFreePlan && !isExpired && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-medium text-sm text-foreground mb-2">Your Benefits</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {plan.link_limit === null ? (
                <li>â€¢ Unlimited payment links</li>
              ) : (
                <li>â€¢ {plan.link_limit} payment links</li>
              )}
              <li>â€¢ {plan.platform_fee_percent}% platform fee</li>
              <li>â€¢ {plan.analytics_level === 'premium' ? 'Premium' : plan.analytics_level === 'advanced' ? 'Advanced' : 'Basic'} analytics</li>
              <li>â€¢ Priority support</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

