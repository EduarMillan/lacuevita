import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "email" | "recovery" | null;

  if (token_hash && type) {
    const supabase = await createClient();
    await supabase.auth.verifyOtp({ token_hash, type });
  }

  return NextResponse.redirect(`${origin}/`);
}
