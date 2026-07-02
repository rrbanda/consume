/** API proxy to Paperclip -- per consumer-ui-auth-flow skill
 * All client-side requests go through this proxy to hide the internal URL
 * and add authentication headers.
 */
import { config } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const search = request.nextUrl.searchParams.toString();
  const url = `${config.paperclipApiUrl}/api/${apiPath}${search ? `?${search}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const body = await request.text();
  const url = `${config.paperclipApiUrl}/api/${apiPath}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
