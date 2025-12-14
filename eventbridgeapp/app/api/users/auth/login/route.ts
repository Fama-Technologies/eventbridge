import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { hash } from 'bcryptjs';

// GET — fetch all users
export async function GET() {
  const data = await db.select().from(users);
  return NextResponse.json(data);
}

// POST — create user
export async function POST(req: Request) {
  const body = await req.json();

  // Hash password if provided
  const hashedPassword = body.password ? await hash(body.password, 12) : '';

  await db.insert(users).values({
    firstName: body.firstName || '',
    lastName: body.lastName || '',
    email: body.email,
    password: hashedPassword,
    accountType: body.accountType || 'CUSTOMER',
    provider: 'local',
  });

  return NextResponse.json({ success: true });
}