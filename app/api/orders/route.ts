import { NextResponse } from "next/server";

import { listOrders } from "@/lib/orders-store";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-admin-api-key");

  if (!process.env.ADMIN_API_KEY || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ orders: listOrders() });
}
