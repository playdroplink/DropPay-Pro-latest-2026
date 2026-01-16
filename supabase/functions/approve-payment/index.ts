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
    console.error('❌ PI_API_KEY not configured in Supabase secrets');
    return new Response(
      JSON.stringify({ error: 'PI_API_KEY not configured in Supabase secrets. Run: supabase secrets set PI_API_KEY="your_key"' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Supabase configuration missing');
    return new Response(
      JSON.stringify({ error: 'Missing Supabase configuration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let payload: { paymentId?: string; paymentLinkId?: string; isCheckoutLink?: boolean; isSubscription?: boolean };
  try {
    payload = await req.json();
  } catch (err) {
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

  // Validate payment link exists if provided
  if (paymentLinkId) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const tableName = isCheckoutLink ? 'checkout_links' : 'payment_links';
    
    const { data: linkData, error: linkError } = await supabase
      .from(tableName)
      .select('id, merchant_id, is_active')
      .eq('id', paymentLinkId)
      .single();
    
    if (linkError || !linkData) {
      console.error('❌ Payment link not found:', paymentLinkId);
      return new Response(
        JSON.stringify({ error: 'Payment link not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!linkData.is_active) {
      console.error('❌ Payment link inactive:', paymentLinkId);
      return new Response(
        JSON.stringify({ error: 'Payment link is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  console.log('✅ Approving payment:', { paymentId, paymentLinkId, isCheckoutLink, isSubscription });

  try {
    const response = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pi API approve error:', { status: response.status, body: errorText });
      return new Response(
        JSON.stringify({ error: 'Pi API approve failed', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Payment approved:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error approving payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
