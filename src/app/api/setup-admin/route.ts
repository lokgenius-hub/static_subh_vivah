import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "admin@vivahsthal.com";
const ADMIN_PASSWORD = "Admin@Vivah2024";

export async function GET() {
  try {
    const serviceClient = await createServiceClient();

    const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email === ADMIN_EMAIL
    );

    if (existing) {
      await serviceClient.from("profiles").upsert(
        {
          id: existing.id,
          full_name: "Admin",
          email: ADMIN_EMAIL,
          role: "admin",
        },
        { onConflict: "id" }
      );

      return NextResponse.json({
        message: "Admin already exists — role ensured.",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
    }

    const { data, error } = await serviceClient.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin", role: "admin" },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (data.user) {
      await serviceClient.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: "Admin",
          email: ADMIN_EMAIL,
          role: "admin",
        },
        { onConflict: "id" }
      );
    }

    return NextResponse.json({
      message: "Admin account created successfully!",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
