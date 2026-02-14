// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { adId, merchantId, piUsername } = await req.json();

    if (!adId || !merchantId || !piUsername) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if reward already exists for this ad
    const { data: existingReward } = await supabase
      .from('ad_rewards')
      .select('*')
      .eq('ad_id', adId)
      .maybeSingle();

    if (existingReward) {
      return new Response(
        JSON.stringify({
          verified: existingReward.status === 'granted',
          reward_amount: existingReward.reward_amount,
          message: 'Reward already processed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ad status with Pi Platform API
    const piApiKey = Deno.env.get('PI_API_KEY');
    if (!piApiKey) {
      return new Response(
        JSON.stringify({ error: 'PI_API_KEY not configured in Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const piApiUrl = `https://api.minepi.com/v2/ads_network/status/${adId}`;

    let mediatorAckStatus = null;
    let mediatorGrantedAt = null;
    let mediatorRevokedAt = null;

    try {
      const piResponse = await fetch(piApiUrl, {
        headers: {
          'Authorization': `Key ${piApiKey}`,
        },
      });

      if (piResponse.ok) {
        const piData = await piResponse.json();
        mediatorAckStatus = piData.mediator_ack_status;
        mediatorGrantedAt = piData.mediator_granted_at;
        mediatorRevokedAt = piData.mediator_revoked_at;
      }
    } catch (error) {
      console.error('Error verifying with Pi API:', error);
    }

    // Determine reward amount and status
    const rewardAmount = 0.005; // π 0.005 per ad
    const status = mediatorAckStatus === 'granted' ? 'granted' : 'pending';
    const verified = status === 'granted';

    // Store reward in database
    const { data: reward, error: insertError } = await supabase
      .from('ad_rewards')
      .insert({
        merchant_id: merchantId,
        pi_username: piUsername,
        ad_type: 'rewarded',
        ad_id: adId,
        reward_amount: rewardAmount,
        status: status,
        mediator_ack_status: mediatorAckStatus,
        mediator_granted_at: mediatorGrantedAt,
        mediator_revoked_at: mediatorRevokedAt,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // If verified, credit the merchant's balance
    if (verified && reward) {
      try {
        const { data: merchantRow, error: merchantFetchError } = await supabase
          .from('merchants')
          .select('available_balance, total_revenue')
          .eq('id', merchantId)
          .maybeSingle();

        if (merchantFetchError) {
          throw merchantFetchError;
        }

        if (merchantRow) {
          const { error: updateError } = await supabase
            .from('merchants')
            .update({
              available_balance: Number(merchantRow.available_balance || 0) + rewardAmount,
              total_revenue: Number(merchantRow.total_revenue || 0) + rewardAmount,
            })
            .eq('id', merchantId);

          if (updateError) {
            throw updateError;
          }
        }

        // Create notification for merchant
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            merchant_id: merchantId,
            title: '🎉 Ad Reward Earned!',
            message: `You earned π${rewardAmount.toFixed(4)} from watching an ad!`,
            type: 'success',
            is_read: false,
          });

        if (notificationError) {
          console.log('Notification creation skipped:', notificationError);
        }
      } catch (error) {
        console.error('Error crediting reward to merchant:', error);
        // Continue anyway - reward is recorded in db and trigger will handle it
      }
    }

    return new Response(
      JSON.stringify({
        verified,
        reward_amount: rewardAmount,
        status: status,
        message: verified ? 'Reward granted successfully!' : 'Reward pending verification',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
