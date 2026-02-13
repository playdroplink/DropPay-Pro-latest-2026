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

  if (!PI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing required server configuration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let payload: {
    paymentId?: string;
    txid?: string;
    paymentLinkId?: string;
    payerUsername?: string;
    buyerEmail?: string;
    amount?: number;
    isCheckoutLink?: boolean;
    isSubscription?: boolean;
    paymentType?: string;
    merchantId?: string;
    planId?: string;
  };

  try {
    payload = await req.json();
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { paymentId, txid, paymentLinkId, payerUsername, buyerEmail, amount, isCheckoutLink, isSubscription, paymentType, merchantId, planId } = payload;

  if (!paymentId || !txid) {
    return new Response(
      JSON.stringify({ error: 'paymentId and txid are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Completing payment:', { paymentId, txid, paymentLinkId, isCheckoutLink, isSubscription, paymentType });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Check for duplicate payment completion
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('pi_payment_id', paymentId)
    .limit(1)
    .maybeSingle();

  if (existingTx) {
    console.log('Payment already completed:', paymentId);
    return new Response(
      JSON.stringify({ success: true, message: 'Payment already completed', transactionId: existingTx.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Expired merchants cannot accept payments until renewal.
  // If no subscription row exists, merchant is treated as Free and allowed.
  if (paymentLinkId) {
    const tableName = isCheckoutLink ? 'checkout_links' : 'payment_links';
    const { data: preLink, error: preLinkError } = await supabase
      .from(tableName)
      .select('merchant_id, is_active')
      .eq('id', paymentLinkId)
      .maybeSingle();

    if (preLinkError || !preLink) {
      return new Response(
        JSON.stringify({ error: 'Payment link not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!preLink.is_active) {
      return new Response(
        JSON.stringify({ error: 'Payment link is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: latestActiveSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('status, current_period_end, expires_at, last_payment_at')
      .eq('merchant_id', preLink.merchant_id)
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

  try {
    const response = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid }),
      }
    );

    let result: any = null;
    if (!response.ok) {
      const errorText = await response.text();
      const lower = (errorText || '').toLowerCase();
      const isAlreadyCompleted =
        (response.status === 400 || response.status === 409) &&
        (lower.includes('already') || lower.includes('completed') || lower.includes('duplicate'));

      if (!isAlreadyCompleted) {
        console.error('Pi API complete error:', { status: response.status, body: errorText });
        return new Response(
          JSON.stringify({ error: 'Pi API complete failed', details: errorText, piStatus: response.status }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.warn('Pi API reports payment already completed; continuing idempotently', {
        paymentId,
        status: response.status,
        body: errorText,
      });
      result = { alreadyCompleted: true };
    } else {
      result = await response.json();
      console.log('Payment completed on Pi Network:', result);
    }

    if (paymentLinkId) {
      let linkData: { merchant_id: string; amount: number; stock?: number | null; is_unlimited_stock?: boolean } | null = null;

      if (isCheckoutLink) {
        const { data, error } = await supabase
          .from('checkout_links')
          .select('merchant_id, amount, stock, is_unlimited_stock')
          .eq('id', paymentLinkId)
          .single();
        if (error) {
          console.error('❌ Fetch checkout_link error:', error);
          return new Response(
            JSON.stringify({ error: 'Checkout link not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        linkData = data ?? null;
      } else {
        const { data, error } = await supabase
          .from('payment_links')
          .select('merchant_id, amount, stock, is_unlimited_stock')
          .eq('id', paymentLinkId)
          .single();
        if (error) {
          console.error('❌ Fetch payment_link error:', error);
          return new Response(
            JSON.stringify({ error: 'Payment link not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        linkData = data ?? null;
      }

      if (linkData) {
        // Decrement stock if applicable
        if (!linkData.is_unlimited_stock && linkData.stock !== null && linkData.stock > 0) {
          const tableName = isCheckoutLink ? 'checkout_links' : 'payment_links';
          const { error: stockError } = await supabase
            .from(tableName)
            .update({ stock: linkData.stock - 1 })
            .eq('id', paymentLinkId);

          if (stockError) {
            console.error('⚠️ Failed to decrement stock:', stockError);
          } else {
            console.log('✅ Stock decremented:', linkData.stock - 1);
          }
        }

        // Record transaction
        const finalAmount = amount ?? result?.payment?.amount ?? linkData.amount;
        const transactionPayload = {
          merchant_id: linkData.merchant_id,
          payment_link_id: isCheckoutLink ? null : paymentLinkId,
          pi_payment_id: paymentId,
          payer_pi_username: payerUsername,
          amount: finalAmount,
          status: 'completed',
          completed_at: new Date().toISOString(),
          txid,
          buyer_email: buyerEmail,
          metadata: {
            source_link_table: isCheckoutLink ? 'checkout_links' : 'payment_links',
            source_link_id: paymentLinkId,
          },
        };

        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .insert(transactionPayload)
          .select()
          .single();

        if (txError) {
          console.error('❌ Transaction insert error:', txError);
          return new Response(
            JSON.stringify({ error: 'Failed to record transaction', details: txError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Transaction recorded:', txData?.id);

        // Always ensure we have a transaction ID to return
        if (!txData?.id) {
          console.error('❌ Transaction created but no ID returned');
          return new Response(
            JSON.stringify({ error: 'Transaction recorded but no ID returned' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Handle subscription activation for Pi payments (with payment link)
        if (isSubscription && (payerUsername || merchantId)) {
          console.log('🔄 Processing subscription activation for Pi payment...');

          // Try to extract plan info from payment metadata or title
          let planName = null;
          if (paymentType) {
            // Extract plan name from payment type/title
            const planMatch = paymentType.match(/\b(Free|Basic|Growth|Pro|Scale|Enterprise)\b/i);
            if (planMatch) planName = planMatch[1];
          }

          // Query subscription plans
          const { data: plans } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('amount', { ascending: true });

          if (plans && plans.length > 0) {
            // Find matching plan by name, amount, or default
            let targetPlan = null;

            if (planName) {
              targetPlan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
            }

            if (!targetPlan && amount) {
              // Match by amount
              targetPlan = plans.find(p => Math.abs(p.amount - amount) < 0.01);
            }

            if (!targetPlan) {
              // Default to Basic plan or first paid plan
              targetPlan = plans.find(p => p.name === 'Basic') || plans.find(p => p.amount > 0) || plans[0];
            }

            const periodEnd = new Date();
            periodEnd.setDate(periodEnd.getDate() + 30); // 30 days subscription

            console.log('📦 Activating subscription:', {
              merchantId: linkData.merchant_id,
              plan: targetPlan.name,
              piUsername: payerUsername,
              amount: amount,
              periodStart: new Date().toISOString(),
              periodEnd: periodEnd.toISOString()
            });

            const { error: subError } = await supabase
              .from('user_subscriptions')
              .upsert({
                merchant_id: merchantId || linkData.merchant_id,
                pi_username: payerUsername || null,
                plan_id: targetPlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                last_payment_at: new Date().toISOString(),
              }, {
                onConflict: 'merchant_id',
              });

            if (subError) {
              console.error('❌ Subscription activation failed:', subError);
            } else {
              console.log('✅ Subscription activated successfully:', targetPlan.name);

              // Create notification for merchant
              await supabase
                .from('notifications')
                .insert({
                  merchant_id: merchantId || linkData.merchant_id,
                  title: '🎉 Subscription Activated!',
                  message: `Your ${targetPlan.name} plan is now active. Enjoy ${targetPlan.link_limit ?? 'unlimited'} payment links!`,
                  type: 'success',
                  is_read: false,
                });
            }
          } else {
            console.error('❌ No subscription plans found in database');
          }
        }

        if (isCheckoutLink) {
          const { data: currentLink, error: convError } = await supabase
            .from('checkout_links')
            .select('conversions')
            .eq('id', paymentLinkId)
            .single();

          if (convError) {
            console.error('Fetch conversions error:', convError);
          }

          const newConversions = (currentLink?.conversions ?? 0) + 1;

          const { error: updateError } = await supabase
            .from('checkout_links')
            .update({ conversions: newConversions })
            .eq('id', paymentLinkId);

          if (updateError) {
            console.error('Update conversions error:', updateError);
          }
        } else {
          const { error: rpcError } = await supabase.rpc('increment_conversions', { link_id: paymentLinkId });
          if (rpcError) {
            console.error('RPC increment_conversions error:', rpcError);
          }
        }

        return new Response(
          JSON.stringify({ success: true, result, transactionId: txData?.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle subscription activation for Pi payments (without payment link)
    if (!paymentLinkId && isSubscription) {
      try {
        // Determine merchant
        let resolvedMerchantId = merchantId;
        if (!resolvedMerchantId && payerUsername) {
          const { data: merchantRow } = await supabase
            .from('merchants')
            .select('id')
            .eq('pi_username', payerUsername)
            .maybeSingle();
          resolvedMerchantId = merchantRow?.id || null;
        }

        if (!resolvedMerchantId) {
          console.error('❌ Cannot resolve merchant for subscription activation');
        } else {
          // Resolve target plan
          let targetPlan: any = null;
          if (planId) {
            const { data: planRow } = await supabase
              .from('subscription_plans')
              .select('*')
              .eq('id', planId)
              .maybeSingle();
            targetPlan = planRow;
          }

          if (!targetPlan) {
            const { data: plans } = await supabase
              .from('subscription_plans')
              .select('*')
              .order('amount', { ascending: true });

            if (plans && plans.length > 0) {
              if (paymentType) {
                const match = paymentType.match(/\b(Free|Basic|Growth|Pro|Scale|Enterprise)\b/i);
                if (match) targetPlan = plans.find(p => p.name.toLowerCase() === match[1].toLowerCase());
              }
              if (!targetPlan && amount) {
                targetPlan = plans.find(p => Math.abs(p.amount - amount) < 0.01) || null;
              }
              if (!targetPlan) {
                targetPlan = plans.find(p => p.name === 'Basic') || plans.find(p => p.amount > 0) || plans[0];
              }
            }
          }

          if (targetPlan) {
            const periodEnd = new Date();
            periodEnd.setDate(periodEnd.getDate() + 30);

            const { error: subError } = await supabase
              .from('user_subscriptions')
              .upsert({
                merchant_id: resolvedMerchantId,
                pi_username: payerUsername || null,
                plan_id: targetPlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                last_payment_at: new Date().toISOString(),
              }, {
                onConflict: 'merchant_id',
              });

            if (subError) {
              console.error('❌ Subscription activation failed (no link):', subError);
            } else {
              console.log('✅ Subscription activated successfully (no link):', targetPlan.name);

              // Record a transaction for this subscription payment even without a payment link
              try {
                const finalAmount = amount ?? targetPlan.amount ?? result?.payment?.amount;
                const { data: txData, error: txError } = await supabase
                  .from('transactions')
                  .insert({
                    merchant_id: resolvedMerchantId,
                    payment_link_id: null,
                    pi_payment_id: paymentId,
                    payer_pi_username: payerUsername || null,
                    amount: finalAmount,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    txid,
                    buyer_email: buyerEmail || null,
                  })
                  .select()
                  .single();

                if (txError) {
                  console.error('⚠️ Failed to record subscription transaction (no link):', txError);
                } else {
                  console.log('✅ Subscription transaction recorded (no link):', txData?.id);
                }
              } catch (txErr) {
                console.error('⚠️ Unexpected error inserting subscription transaction:', txErr);
              }

              await supabase
                .from('notifications')
                .insert({
                  merchant_id: resolvedMerchantId,
                  title: '🎉 Subscription Activated! ',
                  message: `Your ${targetPlan.name} plan is now active. Enjoy ${targetPlan.link_limit ?? 'unlimited'} payment links!`,
                  type: 'success',
                  is_read: false,
                });
            }
          } else {
            console.error('❌ Unable to resolve subscription plan');
          }
        }
      } catch (e) {
        console.error('❌ Error in subscription activation (no link):', e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error completing payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
