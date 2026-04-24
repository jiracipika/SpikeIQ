import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcrypt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestAccount() {
  try {
    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "jiracipika@test.local",
      password: "test",
      email_confirm: true,
    });

    if (authError) throw authError;

    console.log("[v0] Auth user created:", authUser.user?.id);

    // 2. Create profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user!.id,
        displayName: "Jiracipika",
        tagline: "#NA1",
        region: "NA",
        accountLinked: false,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    console.log("[v0] Profile created:", profile);

    console.log("\n✅ Test account created successfully!");
    console.log("Email: jiracipika@test.local");
    console.log("Password: test");
    console.log("Display name: Jiracipika #NA1");
    console.log("Region: NA");
  } catch (err) {
    console.error("[v0] Error creating test account:", err);
    process.exit(1);
  }
}

createTestAccount();
