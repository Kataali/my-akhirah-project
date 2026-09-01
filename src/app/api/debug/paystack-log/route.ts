import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.DEBUG_PAYSTACK_SECRET;
  if (!expected || secret !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const path = "/tmp/paystack-verify.log";
  try {
    const fs = await import("fs");
    const data = await fs.promises.readFile(path, "utf8");
    const lines = data.trim().split(/\r?\n/);
    const tail = lines.slice(-200).join("\n");
    return new NextResponse(tail || "", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    return new NextResponse("", { status: 204 });
  }
}
