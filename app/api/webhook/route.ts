import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  console.log("miniapp webhook:", body);
  return NextResponse.json({ ok: true });
}
