import { NextResponse, type NextRequest } from "next/server";

// app/api/debug/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('DEBUG Request body:', body);
  console.log('DEBUG Body keys:', Object.keys(body));
  
  return NextResponse.json({
    received: body,
    keys: Object.keys(body),
    businessNameLength: body.businessName?.length,
    serviceDescriptionLength: body.serviceDescription?.length
  });
}