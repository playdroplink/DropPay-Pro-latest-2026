import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalEmailRequest {
  withdrawalId: string;
  merchantEmail: string;
  merchantName?: string;
  withdrawalAmount: number;
  netAmount: number;
  platformFee: number;
  status: 'approved' | 'rejected' | 'completed';
  destination: string; // wallet address or @pi_username
  transactionLink?: string;
  estimatedArrival?: string;
}

// Helper function to generate withdrawal status HTML
const generateWithdrawalEmailHTML = (
  status: 'approved' | 'rejected' | 'completed',
  merchantName: string | undefined,
  withdrawalAmount: number,
  platformFee: number,
  netAmount: number,
  destination: string,
  transactionLink?: string,
  estimatedArrival?: string
): string => {
  const isApproved = status === 'approved' || status === 'completed';
  const title = status === 'rejected' 
    ? 'Withdrawal Request Rejected ❌'
    : status === 'completed'
    ? 'Withdrawal Complete ✅'
    : 'Withdrawal Approved ✅';

  const color = status === 'rejected' ? '#ef4444' : '#10b981';
  const bgColor = status === 'rejected' ? '#fee2e2' : '#ecfdf5';
  const borderColor = status === 'rejected' ? '#fca5a5' : '#6ee7b7';

  const greeting = merchantName ? `Hi ${merchantName},` : 'Hello,';

  let mainContent = '';
  
  if (status === 'rejected') {
    mainContent = `
      <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Unfortunately, your withdrawal request has been rejected. Please contact support if you have questions.
      </p>
      <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>⚠️ Withdrawal Rejected</strong><br/>
          Amount: π${withdrawalAmount.toFixed(4)}
        </p>
      </div>
      <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 0;">
        If you believe this is an error, please contact support@droppay.space.
      </p>
    `;
  } else {
    mainContent = `
      <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Great news! Your withdrawal has been ${status === 'completed' ? 'completed' : 'approved'}. Here are the details:
      </p>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="color: #71717a; font-size: 14px;">Requested Amount</span>
          <span style="color: #18181b; font-size: 18px; font-weight: 600;">π${withdrawalAmount.toFixed(4)}</span>
        </div>
        <div style="border-top: 1px solid #e4e4e7; padding-top: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #71717a; font-size: 14px;">Platform Fee (2%)</span>
            <span style="color: #ef4444; font-size: 14px;">-π${platformFee.toFixed(4)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #71717a; font-size: 14px;">You Will Receive</span>
            <span style="color: #10b981; font-size: 18px; font-weight: 600;">π${netAmount.toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #065f46; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Destination</p>
        <p style="color: #047857; font-size: 14px; word-break: break-all; margin: 0; font-family: monospace;">${destination}</p>
      </div>
      
      ${estimatedArrival ? `
        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #1e40af; font-size: 14px; margin: 0;">
            <strong>📅 Estimated Arrival:</strong> ${estimatedArrival}
          </p>
        </div>
      ` : ''}
      
      ${transactionLink && status === 'completed' ? `
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${transactionLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            View Transaction
          </a>
        </div>
      ` : ''}
      
      <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 0;">
        If you have any questions, please contact support@droppay.space.
      </p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, ${color}, ${color}); padding: 12px; border-radius: 12px; opacity: 0.9;">
              <span style="font-size: 28px;">${status === 'rejected' ? '❌' : '✅'}</span>
            </div>
            <h1 style="margin: 16px 0 0; color: #18181b; font-size: 24px;">${title}</h1>
            <p style="color: #71717a; font-size: 14px; margin: 8px 0 0;">${greeting}</p>
          </div>
          
          ${mainContent}
        </div>
        
        <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
          Powered by DropPay - Pi Network Payment Gateway
        </p>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      withdrawalId,
      merchantEmail,
      merchantName,
      withdrawalAmount,
      netAmount,
      platformFee,
      status,
      destination,
      transactionLink,
      estimatedArrival,
    }: WithdrawalEmailRequest = await req.json();

    console.log("Processing withdrawal email:", {
      withdrawalId,
      merchantEmail,
      status,
      amount: withdrawalAmount,
    });

    const fromAddress = "DropPay <onboarding@resend.dev>";
    const subjectMap = {
      approved: `Withdrawal Approved ✅ - π${withdrawalAmount.toFixed(4)}`,
      rejected: `Withdrawal Request Rejected ❌ - π${withdrawalAmount.toFixed(4)}`,
      completed: `Withdrawal Complete ✅ - π${netAmount.toFixed(4)} Received`,
    };

    const subject = subjectMap[status];

    const htmlContent = generateWithdrawalEmailHTML(
      status,
      merchantName,
      withdrawalAmount,
      platformFee,
      netAmount,
      destination,
      transactionLink,
      estimatedArrival
    );

    // Send email
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [merchantEmail],
      subject,
      html: htmlContent,
    });

    console.log("Withdrawal email sent successfully:", emailResponse);

    // Update withdrawal record to mark email as sent
    const { error: updateError } = await supabase
      .from("withdrawals")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId);

    if (updateError) {
      console.error("Error updating withdrawal email status:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Withdrawal notification email sent",
        emailResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-withdrawal-email function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
