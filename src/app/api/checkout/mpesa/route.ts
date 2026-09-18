// src/app/api/checkout/mpesa/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, amount, reference } = await req.json();

    // 1. Bulletproof Phone Number Formatter
    // Strip everything that isn't a number (spaces, dashes, plus signs, brackets)
    let formattedPhone = phone.replace(/[^0-9]/g, ""); 

    // Auto-correct to Safaricom's required 254 format
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("7") || formattedPhone.startsWith("1")) {
      formattedPhone = "254" + formattedPhone;
    } else if (formattedPhone.startsWith("254") && formattedPhone.length > 12) {
      // Just in case someone typed something wild like 25407...
       formattedPhone = "254" + formattedPhone.slice(-9);
    }

    // Final security check: must be exactly 12 digits starting with 254
    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid phone format. Please use standard Kenyan format (e.g., 07XX... or 01XX...)" 
      }, { status: 400 });
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const baseUrl = process.env.MPESA_ENVIRONMENT === "production" 
      ? "https://api.safaricom.co.ke" 
      : "https://sandbox.safaricom.co.ke";

    // 2. Generate OAuth Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) throw new Error("Failed to authenticate with Safaricom");
    const { access_token } = await tokenRes.json();

    // 3. Prepare STK Push Payload
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount), // M-Pesa strictly requires whole numbers
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mpesa`,
      AccountReference: reference || "Nova Atelier",
      TransactionDesc: "Payment for Nova Atelier Order",
    };

    // 4. Trigger STK Push
    const pushRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const pushData = await pushRes.json();

    if (pushData.ResponseCode === "0") {
      return NextResponse.json({ success: true, message: "STK Push sent successfully", data: pushData });
    } else {
      throw new Error(pushData.errorMessage || "STK Push failed");
    }

  } catch (error: any) {
    console.error("M-Pesa API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}