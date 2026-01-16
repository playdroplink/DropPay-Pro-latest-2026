import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

  try {
    const {
      transactionId,
      buyerEmail,
      paymentLinkTitle,
      merchantName,
      payerUsername,
      amount,
      currency,
      txid,
      isBlockchainVerified,
    } = await req.json();

    if (!buyerEmail || !transactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const receiptDate = new Date().toLocaleString();
    const receiptContent = `
TRANSACTION RECEIPT - DropPay
═══════════════════════════════════════════════════════════

Receipt #: ${transactionId}
Date: ${receiptDate}

PAYMENT DETAILS
───────────────────────────────────────────────────────────
Product/Service: ${paymentLinkTitle}
Merchant: ${merchantName}
Amount: ${currency === 'Pi' ? 'π' : currency} ${Number(amount).toFixed(2)}

PAYER INFORMATION
───────────────────────────────────────────────────────────
Username: @${payerUsername}
Email: ${buyerEmail}

BLOCKCHAIN VERIFICATION
───────────────────────────────────────────────────────────
Transaction ID: ${txid || 'Pending verification'}
Verification Status: ${isBlockchainVerified ? '✓ VERIFIED' : '⏳ Verifying...'}

═══════════════════════════════════════════════════════════

PROOF OF PAYMENT

This receipt serves as proof of payment and can be used by both:
- Payer: As proof of payment made to the merchant
- Merchant: As verification of payment received from the customer

Keep this receipt for your records. If you have any questions about 
this transaction, please contact us.

═══════════════════════════════════════════════════════════

DropPay - Pi Payment Platform
https://droppay.space

Powered by Pi Network | Blockchain Verified Payment
`;

    // Create HTML version of receipt
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #10b981; margin: 0; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px; }
    .section-content { padding: 10px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; }
    .label { color: #666; font-weight: bold; }
    .value { color: #333; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    .verified { color: #10b981; font-weight: bold; }
    .pending { color: #f59e0b; font-weight: bold; }
    .footer { background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .badge { background-color: #dbeafe; color: #0369a1; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Successful</h1>
      <p>Thank you for your payment!</p>
    </div>

    <div class="section">
      <div class="section-title">Receipt #${transactionId}</div>
      <div class="section-content">
        <div class="row">
          <span class="label">Date:</span>
          <span class="value">${receiptDate}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="section-content">
        <div class="row">
          <span class="label">Product/Service:</span>
          <span class="value">${paymentLinkTitle}</span>
        </div>
        <div class="row">
          <span class="label">Merchant:</span>
          <span class="value">${merchantName}</span>
        </div>
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <div class="row">
            <span class="label">Amount Paid:</span>
            <span class="amount">${currency === 'Pi' ? 'π' : currency} ${Number(amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Payer Information</div>
      <div class="section-content">
        <div class="row">
          <span class="label">Username:</span>
          <span class="value">@${payerUsername}</span>
        </div>
        <div class="row">
          <span class="label">Email:</span>
          <span class="value">${buyerEmail}</span>
        </div>
      </div>
    </div>

    ${txid ? `
    <div class="section">
      <div class="section-title">Blockchain Verification</div>
      <div class="section-content">
        <div class="row">
          <span class="label">Status:</span>
          <span class="${isBlockchainVerified ? 'verified' : 'pending'}">
            ${isBlockchainVerified ? '✓ VERIFIED' : '⏳ Verifying...'}
          </span>
        </div>
        <div class="row">
          <span class="label">Transaction ID:</span>
          <span class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${txid}</span>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>Proof of Payment</strong></p>
      <p>This receipt serves as proof of payment and can be used by both payer and merchant.</p>
      <p style="margin-top: 10px;">
        <span class="badge">DropPay - Pi Payment Platform</span>
      </p>
      <p style="margin-top: 10px;">
        For support: <a href="https://droppay.space" style="color: #0369a1; text-decoration: none;">droppay.space</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.warn('⚠️ RESEND_API_KEY not configured');
      console.log('📧 Email would be sent to:', buyerEmail);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Receipt email prepared (API not configured)',
          email: buyerEmail,
          transactionId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email via Resend
    console.log('📧 Sending receipt email to:', buyerEmail);
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DropPay Support <noreply@droppay.space>',
        to: buyerEmail,
        subject: `DropPay Transaction Receipt - ${transactionId}`,
        html: htmlContent,
        text: receiptContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendData);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to send email',
          error: resendData.message || 'Resend API error',
          email: buyerEmail,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Receipt email sent successfully:', {
      email: buyerEmail,
      transactionId,
      resendId: resendData.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Receipt email sent successfully',
        email: buyerEmail,
        transactionId,
        emailId: resendData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
