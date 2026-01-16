import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to generate email HTML
const generateEmailHTML = (productTitle: string, downloadUrl: string, recipientName?: string): string => {
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
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px; border-radius: 12px;">
              <span style="font-size: 24px;">⚡</span>
            </div>
            <h1 style="margin: 16px 0 0; color: #18181b; font-size: 24px;">Your Download is Ready!</h1>
            ${recipientName ? `<p style="color: #71717a; font-size: 14px; margin: 8px 0 0;">Hi ${recipientName},</p>` : ''}
          </div>
          
          <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for your purchase! Your payment has been confirmed and your content is ready for download.
          </p>
          
          <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 8px;">Product</p>
            <p style="color: #18181b; font-size: 18px; font-weight: 600; margin: 0;">${productTitle}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px;">Click the button below to download your content</p>
            <a href="${downloadUrl}" style="display: inline-block; background: white; color: #6366f1; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Download Now
            </a>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
              <strong>⚠️ Important:</strong> If you're using Pi Browser, the download may not work directly. Please copy this link and paste it in another browser (Chrome, Safari, Firefox, etc.):
            </p>
            <p style="color: #78350f; font-size: 12px; word-break: break-all; margin: 12px 0 0; background: white; padding: 10px; border-radius: 6px; font-family: monospace;">${downloadUrl}</p>
          </div>
          
          <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 0;">
            This link will expire in 24 hours. If you have any issues, please contact the seller.
          </p>
        </div>
        
        <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 24px;">
          Powered by DropPay - Pi Network Payment Gateway
        </p>
      </div>
    </body>
    </html>
  `;
};

interface SendDownloadEmailRequest {
  transactionId: string;
  buyerEmail: string;
  paymentLinkId: string;
  downloadUrl: string;
  productTitle: string;
  // Optional advanced features
  batchEmails?: Array<{
    email: string;
    recipientName?: string;
  }>;
  scheduleTime?: string; // ISO 8601 format for scheduling
  attachmentUrl?: string; // URL to file to attach
  attachmentFileName?: string;
  ccEmails?: string[]; // Carbon copy recipients
  bccEmails?: string[]; // Blind carbon copy recipients
  tags?: Record<string, string>; // For email tracking
}

interface BatchEmailRequest {
  emails: Array<{
    to: string;
    productTitle: string;
    downloadUrl: string;
    recipientName?: string;
  }>;
  from?: string;
}

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
      transactionId,
      buyerEmail,
      paymentLinkId,
      downloadUrl,
      productTitle,
      batchEmails,
      scheduleTime,
      attachmentUrl,
      attachmentFileName,
      ccEmails,
      bccEmails,
      tags,
    }: SendDownloadEmailRequest = await req.json();

    console.log("Processing email request:", {
      transactionId,
      buyerEmail,
      productTitle,
      isBatch: !!batchEmails,
      isScheduled: !!scheduleTime,
    });

    const fromAddress = "DropPay <noreply@droppay.space>";
    const emailSubject = `🎉 Your purchase is ready! Download "${productTitle}"`;

    // Handle batch emails if provided
    if (batchEmails && batchEmails.length > 0) {
      console.log(`Sending batch email to ${batchEmails.length} recipients`);

      const batchPayload = batchEmails.map((recipient) => ({
        from: fromAddress,
        to: [recipient.email],
        subject: emailSubject,
        html: generateEmailHTML(productTitle, downloadUrl, recipient.recipientName),
        ...(ccEmails && { cc: ccEmails }),
        ...(bccEmails && { bcc: bccEmails }),
        ...(tags && { tags }),
      }));

      const batchResponse = await resend.batch.send(batchPayload);
      console.log("Batch email sent:", batchResponse);

      // Update transaction
      await supabase.from("transactions").update({
        buyer_email: buyerEmail,
        email_sent: true,
        email_batch_count: batchEmails.length,
      }).eq("id", transactionId);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Batch email sent to ${batchEmails.length} recipients`,
          batchResponse,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Build email payload for single email
    const emailPayload: any = {
      from: fromAddress,
      to: [buyerEmail],
      subject: emailSubject,
      html: generateEmailHTML(productTitle, downloadUrl),
      ...(ccEmails && { cc: ccEmails }),
      ...(bccEmails && { bcc: bccEmails }),
      ...(tags && { tags }),
    };

    // Add scheduled time if provided
    if (scheduleTime) {
      emailPayload.scheduledAt = scheduleTime;
      console.log("Email scheduled for:", scheduleTime);
    }

    // Add attachment if provided
    if (attachmentUrl && attachmentFileName) {
      try {
        const attachmentResponse = await fetch(attachmentUrl);
        const attachmentBuffer = await attachmentResponse.arrayBuffer();
        const base64Attachment = btoa(String.fromCharCode(...new Uint8Array(attachmentBuffer)));

        emailPayload.attachments = [
          {
            filename: attachmentFileName,
            content: base64Attachment,
          },
        ];
        console.log("Attachment added:", attachmentFileName);
      } catch (attachmentError) {
        console.error("Error attaching file:", attachmentError);
        // Continue without attachment rather than failing
      }
    }

    // Send email with download link
    const emailResponse = await resend.emails.send(emailPayload);
    console.log("Email sent successfully:", emailResponse);

    // Extract email ID from response for later reference
    const emailId = (emailResponse as any)?.id;

    // Update transaction to mark email as sent
    await supabase
      .from("transactions")
      .update({
        buyer_email: buyerEmail,
        email_sent: true,
        email_id: emailId, // Store Resend email ID for tracking
        scheduled_at: scheduleTime || null,
      })
      .eq("id", transactionId);

    console.log("Transaction updated:", transactionId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailId,
        emailResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-download-email function:", error);
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
