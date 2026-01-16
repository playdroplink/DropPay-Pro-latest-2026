import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": [
    "authorization",
    "x-client-info",
    "apikey",
    "content-type",
    "accept",
    "origin",
    "referer",
    "user-agent",
  ].join(", "),
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { piUserId, piUsername } = await req.json();

    // Validate inputs
    if (!piUserId || !piUsername) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: piUserId, piUsername",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if merchant already exists
    const { data: existingMerchant } = await supabaseAdmin
      .from("merchants")
      .select("id")
      .eq("pi_user_id", piUserId)
      .maybeSingle();

    if (existingMerchant) {
      // Merchant already exists, return it
      return new Response(
        JSON.stringify({
          success: true,
          message: "Merchant already exists",
          merchant: existingMerchant,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create new merchant using service role (bypasses RLS)
    const { data: newMerchant, error } = await supabaseAdmin
      .from("merchants")
      .insert({
        pi_user_id: piUserId,
        pi_username: piUsername,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating merchant:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create merchant",
          details: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Merchant created successfully",
        merchant: newMerchant,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
