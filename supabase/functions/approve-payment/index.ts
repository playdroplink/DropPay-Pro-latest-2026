import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PI_API_BASE = 'https://api.minepi.com/v2';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const PI_API_KEY = Deno.env.get('PI_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!PI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'PI_API_KEY not configured in Supabase secrets' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing Supabase configuration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let payload: { paymentId?: string; paymentLinkId?: string; isCheckoutLink?: boolean; isSubscription?: boolean };
  try {
    payload = await req.json();
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { paymentId, paymentLinkId, isCheckoutLink, isSubscription } = payload;

  if (!paymentId) {
    return new Response(
      JSON.stringify({ error: 'paymentId is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (paymentLinkId) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const tableName = isCheckoutLink ? 'checkout_links' : 'payment_links';

    const { data: linkData, error: linkError } = await supabase
      .from(tableName)
      .select('id, merchant_id, is_active')
      .eq('id', paymentLinkId)
      .single();

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: 'Payment link not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!linkData.is_active) {
      return new Response(
        JSON.stringify({ error: 'Payment link is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Expired merchants cannot accept normal payments until renewal.
    // For subscription purchases/renewals, skip this guard so merchants can reactivate.
    if (!isSubscription) {
      const { data: latestActiveSub, error: subError } = await supabase
        .from('user_subscriptions')
        .select('status, current_period_end, expires_at, last_payment_at')
        .eq('merchant_id', linkData.merchant_id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false, nullsFirst: false })
        .order('last_payment_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        return new Response(
          JSON.stringify({ error: 'Subscription validation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (latestActiveSub) {
        const expiryValue = latestActiveSub.expires_at || latestActiveSub.current_period_end;
        const isDateExpired = expiryValue ? new Date(expiryValue).getTime() < Date.now() : false;
        const isExpired = isDateExpired;

        if (isExpired) {
          return new Response(
            JSON.stringify({ error: 'Merchant subscription expired. Please renew plan to accept payments.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
  }

  try {
    const response = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'Pi API approve failed', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
