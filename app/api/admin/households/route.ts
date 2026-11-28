import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import { requireAdmin } from "../../../../lib/require-admin";

function getHouseholdDatabaseError(code: string | undefined, message: string) {
  if (message.toLowerCase().includes("invalid api key")) {
    return "SUPABASE_SECRET_KEY is invalid for the configured project. Copy the secret key from the same Supabase project as NEXT_PUBLIC_SUPABASE_URL, then restart Next.js.";
  }
  if (code === "42P01" || code === "PGRST205") {
    return "The households table is missing. Apply the SQL migration in supabase/migrations.";
  }
  if (code === "42501") {
    return "The households table is missing server permissions. Run the updated SQL migration in supabase/migrations.";
  }
  return `Household database request failed (${code ?? "database error"}).`;
}

export async function GET() {
  const authorization = await requireAdmin();
  if (!authorization.ok) return authorization.response;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("households")
      .select("id, unit, building, resident_name, email, balance, status, parking_slot, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Household query failed:", error);
      return NextResponse.json(
        { error: getHouseholdDatabaseError(error.code, error.message) },
        { status: 500 },
      );
    }

    return NextResponse.json({ households: data });
  } catch (error) {
    console.error("Household list setup failed:", error);
    const message = error instanceof Error ? error.message : "Unknown Supabase configuration error.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const authorization = await requireAdmin();
  if (!authorization.ok) return authorization.response;

  let body: {
    unit?: unknown;
    building?: unknown;
    resident?: unknown;
    email?: unknown;
    password?: unknown;
    slot?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const unit = typeof body.unit === "string" ? body.unit.trim().toUpperCase() : "";
  const building = typeof body.building === "string" ? body.building.trim() : "";
  const resident = typeof body.resident === "string" ? body.resident.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const slot = typeof body.slot === "string" ? body.slot.trim().toUpperCase() : "";

  if (!/^[A-Z]{1,2}-\d{2,4}$/.test(unit)) {
    return NextResponse.json({ error: "Enter a valid unit number." }, { status: 400 });
  }
  if (!building || !resident || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
    return NextResponse.json({ error: "Complete all required fields with valid values." }, { status: 400 });
  }
  if (slot && !/^P-\d{2,4}$/.test(slot)) {
    return NextResponse.json({ error: "Enter a parking slot such as P-07, or leave it blank." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: matchingHousehold, error: lookupError } = await supabase
      .from("households")
      .select("id")
      .eq("unit", unit)
      .maybeSingle();

    if (lookupError) {
      console.error("Household unit lookup failed:", lookupError);
      return NextResponse.json(
        { error: getHouseholdDatabaseError(lookupError.code, lookupError.message) },
        { status: 500 },
      );
    }
    if (matchingHousehold) {
      return NextResponse.json({ error: "A household is already registered for this unit." }, { status: 409 });
    }

    const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: resident, household_unit: unit },
      app_metadata: { role: "homeowner" },
    });

    if (authError || !createdUser.user) {
      if (authError) console.error("Homeowner Auth creation failed:", authError);
      const emailAlreadyExists = authError?.message.toLowerCase().includes("already") ?? false;
      const invalidServerKey = authError?.message.toLowerCase().includes("invalid api key") ?? false;
      return NextResponse.json(
        { error: emailAlreadyExists ? "An account already exists for this email address." : invalidServerKey ? "SUPABASE_SECRET_KEY is invalid for the configured project. Copy the secret key from the same Supabase project as NEXT_PUBLIC_SUPABASE_URL, then restart Next.js." : `Could not create the homeowner account${authError?.status ? ` (Auth ${authError.status})` : ""}. Check the Supabase server key and Auth settings.` },
        { status: emailAlreadyExists ? 409 : 400 },
      );
    }

    const { data: household, error: insertError } = await supabase
      .from("households")
      .insert({
        user_id: createdUser.user.id,
        unit,
        building,
        resident_name: resident,
        email,
        balance: 0,
        status: "Current",
        parking_slot: slot || null,
        created_by: authorization.user.id,
      })
      .select("id, unit, building, resident_name, email, balance, status, parking_slot, created_at")
      .single();

    if (insertError || !household) {
      if (insertError) console.error("Household database insert failed:", insertError);
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      const duplicate = insertError?.code === "23505";
      return NextResponse.json(
        { error: duplicate ? "A household already uses this unit or email." : getHouseholdDatabaseError(insertError?.code, insertError?.message ?? "") },
        { status: duplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({ household }, { status: 201 });
  } catch (error) {
    console.error("Household creation setup failed:", error);
    const message = error instanceof Error ? error.message : "Unknown Supabase configuration error.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
