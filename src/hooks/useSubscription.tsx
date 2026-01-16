import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  link_limit: number | null;
  analytics_level: string;
  platform_fee_percent: number;
  features: any;
}

interface UserSubscription {
  id: string;
  plan_id: string | null;
  status: string | null;
  merchant_id: string | null;
  pi_username: string;
  current_period_start: string | null;
  current_period_end: string | null;
  expires_at: string | null;
  started_at: string | null;
  last_payment_at: string | null;
  payment_method?: string;
}

interface SubscriptionData {
  subscription: UserSubscription | null;
  expiredSubscription: UserSubscription | null;
  plan: SubscriptionPlan | null;
  expiredPlan: SubscriptionPlan | null;
  isLoading: boolean;
  linkCount: number;
  canCreateLink: boolean;
  remainingLinks: number | null;
  isFreePlan: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  paymentMethod: string;
  refetch: () => Promise<void>;
}

export function useSubscription(): SubscriptionData {
  const { merchant, piUser } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [expiredSubscription, setExpiredSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [expiredPlan, setExpiredPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkCount, setLinkCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const detectPaymentMethod = async (subscriptionId: string): Promise<string> => {
    try {
      // Check if subscription was created via Pi payment (will have recent transaction)
      const { data: piTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('payer_pi_username', piUser?.username)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1);

      if (piTransaction && piTransaction.length > 0) {
        return 'Pi Payment';
      }

      // Otherwise it's DropPay internal payment
      return 'DropPay Internal';
    } catch (error) {
      console.error('Error detecting payment method:', error);
      return 'DropPay Internal';
    }
  };

  const fetchSubscription = async () => {
    if (!merchant?.id && !piUser?.username) {
      setIsLoading(false);
      return;
    }

    try {
      // Get user's active subscription
      let subData = null;
      let subError = null;

      if (merchant?.id) {
        const result = await (supabase as any)
          .from('user_subscriptions')
          .select('*')
          .eq('merchant_id', merchant.id)
          .eq('status', 'active')
          .order('current_period_end', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        subData = result.data;
        subError = result.error;
        
        if (subError) {
          console.warn('Error fetching subscription by merchant_id:', subError);
        }
      }

      // If no subscription found by merchant_id, try by pi_username
      if (!subData && piUser?.username) {
        console.log('📋 Searching subscription by pi_username:', piUser.username);
        const result = await (supabase as any)
          .from('user_subscriptions')
          .select('*')
          .eq('pi_username', piUser.username)
          .eq('status', 'active')
          .order('last_payment_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        subData = result.data;
        subError = result.error;
        
        if (subError) {
          console.warn('Error fetching subscription by pi_username:', subError);
        }
        
        if (subData) {
          console.log('✅ Found subscription by pi_username:', {
            id: subData.id,
            status: subData.status,
            plan_id: subData.plan_id,
            last_payment_at: subData.last_payment_at
          });
        }
      }

      // Check if subscription is expired
      let activeSubscription = subData;
      if (subData?.expires_at || subData?.current_period_end) {
        const expiryDate = new Date(subData.expires_at || subData.current_period_end);
        if (expiryDate < new Date()) {
          console.log('⏰ Subscription expired:', expiryDate);
          // Subscription expired, mark as expired status
          await (supabase as any)
            .from('user_subscriptions')
            .update({ status: 'expired' })
            .eq('id', subData.id)
            .catch(err => console.warn('Could not update expired status:', err));
          
          activeSubscription = null;
          setExpiredSubscription(subData);
        }
      }

      setSubscription(activeSubscription);

      if (activeSubscription?.plan_id) {
        // Get plan details
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', activeSubscription.plan_id)
          .single();

        if (!planError && planData) {
          console.log('📦 Plan loaded:', planData.name);
          setPlan(planData as SubscriptionPlan);
        } else if (planError) {
          console.error('Error fetching plan:', planError);
        }

        // Detect payment method
        const method = await detectPaymentMethod(activeSubscription.id);
        setPaymentMethod(method);
      } else {
        // Default to free plan if no subscription found
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Free')
          .maybeSingle();

        if (freePlan) {
          console.log('📦 Using Free plan (no active subscription)');
          setPlan(freePlan as SubscriptionPlan);
        }
        setPaymentMethod('');
      }

      // Also fetch expired subscription for renewal option
      if (!activeSubscription && (merchant?.id || piUser?.username)) {
        let expiredSub = null;
        
        if (merchant?.id) {
          const result = await (supabase as any)
            .from('user_subscriptions')
            .select('*')
            .eq('merchant_id', merchant.id)
            .eq('status', 'expired')
            .order('expires_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          expiredSub = result.data;
        }

        if (!expiredSub && piUser?.username) {
          const result = await (supabase as any)
            .from('user_subscriptions')
            .select('*')
            .eq('pi_username', piUser.username)
            .eq('status', 'expired')
            .order('last_payment_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          expiredSub = result.data;
        }

        if (expiredSub) {
          setExpiredSubscription(expiredSub);
          
          // Get expired plan details
          const { data: expiredPlanData } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', expiredSub.plan_id)
            .single();

          if (expiredPlanData) {
            setExpiredPlan(expiredPlanData as SubscriptionPlan);
          }
        }
      }

      // Get current link count (payment_links + checkout_links)
      if (merchant?.id) {
        const [paymentLinksResult, checkoutLinksResult] = await Promise.all([
          supabase
            .from('payment_links')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id),
          supabase
            .from('checkout_links')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)
            .catch(() => ({ count: 0 })) // Handle if checkout_links doesn't exist
        ]);

        const paymentCount = paymentLinksResult.count || 0;
        const checkoutCount = checkoutLinksResult.count || 0;
        const totalCount = paymentCount + checkoutCount;
        console.log('📊 Link counts:', { payment: paymentCount, checkout: checkoutCount, total: totalCount });
        setLinkCount(totalCount);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [merchant?.id, piUser?.username]);

  const isFreePlan = !subscription?.plan_id || plan?.name === 'Free';
  const linkLimit = plan?.link_limit;
  const canCreateLink = linkLimit === null || linkCount < linkLimit;
  const remainingLinks = linkLimit === null ? null : Math.max(0, linkLimit - linkCount);
  
  // Calculate expiry info
  const expiryDate = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const isExpired = expiryDate ? expiryDate < new Date() : false;
  const daysUntilExpiry = expiryDate && !isExpired 
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    subscription,
    expiredSubscription,
    plan,
    expiredPlan,
    isLoading,
    linkCount,
    canCreateLink,
    remainingLinks,
    isFreePlan,
    isExpired,
    daysUntilExpiry,
    paymentMethod,
    refetch: fetchSubscription,
  };
}
