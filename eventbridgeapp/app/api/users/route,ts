import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

// GET — fetch all users
export async function GET() {
  const data = await db.select().from(users);
  return NextResponse.json(data);
}

// POST — create user
export async function POST(req: Request) {
  const body = await req.json();

  await db.insert(users).values({
    name: body.name,
    email: body.email,
  });

  return NextResponse.json({ success: true });
}
