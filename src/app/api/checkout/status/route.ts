// src/app/api/checkout/status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const checkoutRequestId = searchParams.get("checkoutRequestId");

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "Missing CheckoutRequestID" }, { status: 400 });
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const baseUrl = process.env.MPESA_ENVIRONMENT === "production" 
      ? "https://api.safaricom.co.ke" 
      : "https://sandbox.safaricom.co.ke";

    // 1. Generate OAuth Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    
    if (!tokenRes.ok) throw new Error("Failed to authenticate with Safaricom");
    const { access_token } = await tokenRes.json();

    // 2. Prepare STK Query Payload
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    // 3. Query Safaricom for Transaction Status
    const queryRes = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const queryData = await queryRes.json();

    // Safaricom Result Codes:
    // 0 = Success
    // 1032 = Cancelled by user
    // errorCode = Pending/Not processed yet
    if (queryData.ResultCode === "0") {
      return NextResponse.json({ status: "paid", receipt: queryData.ResultDesc });
    } else if (queryData.ResultCode === "1032") {
      return NextResponse.json({ status: "cancelled" });
    } else if (queryData.errorCode) {
      return NextResponse.json({ status: "pending" });
    } else {
      return NextResponse.json({ status: "failed", error: queryData.ResultDesc });
    }

  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}