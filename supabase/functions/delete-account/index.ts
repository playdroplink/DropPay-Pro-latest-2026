// @ts-nocheck
// Supabase Edge Function: delete-account
// Deletes the Supabase Auth user for the requesting session.
// Expects Authorization: Bearer <access_token> and JSON body: { user_id: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    // If no token available (client not logged into Supabase Auth), perform a safe no-op
    if (!token) {
      return new Response(JSON.stringify({ ok: true, skipped: "no auth token" }), { status: 200 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id in body" }), { status: 400 });
    }

    const { data: authed, error: getUserError } = await admin.auth.getUser(token);
    if (getUserError || !authed?.user?.id) {
      return new Response(JSON.stringify({ ok: true, skipped: "invalid token" }), { status: 200 });
    }

    // Ensure the requester matches the user being deleted
    if (authed.user.id !== user_id) {
      return new Response(JSON.stringify({ ok: true, skipped: "user mismatch" }), { status: 200 });
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) {
      console.error("Auth admin deleteUser error:", delErr);
      return new Response(JSON.stringify({ error: "Failed to delete auth user" }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("delete-account error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});
