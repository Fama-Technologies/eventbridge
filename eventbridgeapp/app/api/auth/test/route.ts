import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    authenticated: !!session,
    session: session || null,
    headers: {
      "x-auth-method": "next-auth",
    },
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = "force-dynamic";
