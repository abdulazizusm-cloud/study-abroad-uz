import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = userData.user.id;

  const { error: upsertErr } = await admin.from("entitlements").upsert(
    {
      user_id: userId,
      tier: "pro",
      tier_override: "pro",
      override_ends_at: null,
    },
    { onConflict: "user_id" }
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

