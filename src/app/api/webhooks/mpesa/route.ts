// src/app/api/webhooks/mpesa/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Safaricom's payload structure
    const callbackData = data?.Body?.stkCallback;

    if (!callbackData) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log("M-Pesa Webhook Received:", JSON.stringify(callbackData, null, 2));

    if (callbackData.ResultCode === 0) {
      // Payment Successful
      const callbackMetadata = callbackData.CallbackMetadata.Item;
      const amount = callbackMetadata.find((item: any) => item.Name === "Amount")?.Value;
      const receiptNumber = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = callbackMetadata.find((item: any) => item.Name === "PhoneNumber")?.Value;

      // Log the success (In production, you would update the order status in the Neon DB here)
      console.log(`✅ Payment Success: KES ${amount} from ${phoneNumber}. Receipt: ${receiptNumber}`);
    } else {
      // Payment Failed, Cancelled, or Timed Out
      console.log(`❌ Payment Failed: ${callbackData.ResultDesc}`);
    }

    // You MUST return this exact response, otherwise Safaricom will keep retrying the webhook
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  } catch (error) {
    console.error("Error processing M-Pesa webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}