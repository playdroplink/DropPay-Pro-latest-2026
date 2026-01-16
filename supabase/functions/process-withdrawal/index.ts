import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { merchantId, amount, paymentId, txid } = await req.json();
    const PI_API_KEY = Deno.env.get('PI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('Processing withdrawal for merchant:', merchantId, 'amount:', amount);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get merchant's current balance
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('available_balance, total_withdrawn, wallet_address')
      .eq('id', merchantId)
      .single();

    if (merchantError || !merchant) {
      throw new Error('Merchant not found');
    }

    if (amount > Number(merchant.available_balance)) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawals')
      .insert({
        merchant_id: merchantId,
        amount: amount,
        status: 'pending',
        pi_payment_id: paymentId || null,
        txid: txid || null,
      })
      .select()
      .single();

    if (withdrawalError) {
      throw new Error('Failed to create withdrawal record');
    }

    // If we have a txid, the payment is complete - update balances
    if (txid) {
      // Update merchant balance
      await supabase
        .from('merchants')
        .update({
          available_balance: Number(merchant.available_balance) - amount,
          total_withdrawn: Number(merchant.total_withdrawn || 0) + amount,
        })
        .eq('id', merchantId);

      // Mark withdrawal as completed
      await supabase
        .from('withdrawals')
        .update({
          status: 'completed',
          txid: txid,
          completed_at: new Date().toISOString(),
        })
        .eq('id', withdrawal.id);

      console.log('Withdrawal completed:', withdrawal.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      withdrawal,
      newBalance: Number(merchant.available_balance) - (txid ? amount : 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error processing withdrawal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
