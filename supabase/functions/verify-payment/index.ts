import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOW_ORIGIN = Deno.env.get('ALLOW_ORIGIN') || '*';
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BlockchainTransaction {
  txid: string;
  from_address: string;
  to_address: string;
  amount: number;
  status: string;
  block_height?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { txid, expectedAmount, merchantWallet, paymentLinkId } = await req.json();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const PI_API_KEY = Deno.env.get('PI_API_KEY');

    console.log('Verifying payment on blockchain:', { txid, expectedAmount, merchantWallet });

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({
        verified: false,
        error: 'Missing Supabase server configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    // Query Pi Network mainnet API to verify transaction
    // Use Pi Network API v2 where available; fallback kept to mainnet endpoint if needed
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (PI_API_KEY) {
      headers.Authorization = `Key ${PI_API_KEY}`;
    }

    const blockchainResponse = await fetch(`https://api.minepi.com/v2/transactions/${txid}`, {
      method: 'GET',
      headers,
    });

    if (!blockchainResponse.ok) {
      console.error('Blockchain API error:', await blockchainResponse.text());
      return new Response(JSON.stringify({
        verified: false,
        error: 'Transaction not found on blockchain',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const txData = await blockchainResponse.json();
    console.log('Transaction data from blockchain:', txData);

    // Parse the transaction to extract payment details
    // Pi Network uses Stellar-like transaction format
    let senderAddress = '';
    let receiverAddress = '';
    let transactionAmount = 0;

    if (txData.source_account) {
      senderAddress = txData.source_account;
    }

    // Parse operations to find payment details
    if (txData.operations && txData.operations.length > 0) {
      for (const op of txData.operations) {
        if (op.type === 'payment' || op.type_i === 1) {
          receiverAddress = op.to || op.destination;
          transactionAmount = parseFloat(op.amount);
          break;
        }
      }
    }

    // Verify the payment details
    const isAmountValid = Math.abs(transactionAmount - expectedAmount) < 0.0000001;
    const isReceiverValid = !merchantWallet || receiverAddress.toLowerCase() === merchantWallet.toLowerCase();
    const isSuccessful = txData.successful === true;

    const verified = isAmountValid && isReceiverValid && isSuccessful;

    console.log('Verification result:', {
      isAmountValid,
      isReceiverValid,
      isSuccessful,
      verified,
      transactionAmount,
      expectedAmount,
      receiverAddress,
      merchantWallet,
    });

    // Update the transaction in database with verification status
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Locate the latest matching transaction by txid.
    // For checkout links, payment_link_id is null and source link lives in metadata.
    const { data: transactions, error: findError } = await supabase
      .from('transactions')
      .select('id, payment_link_id, metadata, created_at')
      .eq('txid', txid)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!findError && transactions && transactions.length > 0) {
      const matchedTx = paymentLinkId
        ? transactions.find((tx: any) =>
            tx.payment_link_id === paymentLinkId ||
            (tx.metadata?.source_link_id === paymentLinkId)
          ) || transactions[0]
        : transactions[0];

      const update: Record<string, unknown> = {
        blockchain_verified: verified,
        sender_address: senderAddress,
        receiver_address: receiverAddress,
      };

      // Do NOT mark a transaction as "failed" just because blockchain verification
      // is delayed or we cannot fully validate receiver/memo yet.
      if (verified) {
        update.status = 'completed';
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update(update)
        .eq('id', matchedTx.id);
      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }
    } else if (findError) {
      console.error('Error finding transaction to update verification state:', findError);
    }

    return new Response(JSON.stringify({
      verified,
      transaction: {
        txid,
        sender: senderAddress,
        receiver: receiverAddress,
        amount: transactionAmount,
        status: txData.successful ? 'confirmed' : 'pending',
        blockHeight: txData.ledger,
      },
      checks: {
        amountMatch: isAmountValid,
        receiverMatch: isReceiverValid,
        transactionSuccess: isSuccessful,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      verified: false,
      error: message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
