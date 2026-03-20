import { NextResponse } from "next/server";
import { notifyAdminContactSales } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, venueName, email, phone, message } = data;

    if (!name || !venueName || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await notifyAdminContactSales({ name, venueName, email, phone: phone || "Not provided", message });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
