// src/server/actions/checkout.ts
"use server"

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function processOrder(cartItems, totalAmount) {
  // 1. Get the securely authenticated user directly from Clerk
  const user = await currentUser();
  
  if (!user) {
    throw new Error("You must be logged in to checkout.");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress;

  // 2. Just-In-Time Sync: Upsert the user into Neon DB
  await db.insert(users)
    .values({
      id: user.id,
      email: primaryEmail,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      isCitadelMember: user.publicMetadata?.isCitadelMember as boolean || false,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: primaryEmail,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
    });

  // 3. Proceed with creating the order now that the user is guaranteed to exist in Neon
  const newOrder = await db.insert(orders).values({
    userId: user.id,
    totalAmount: totalAmount,
    shippingAddress: "...", // Collected from form
    status: "pending",
  }).returning();

  return newOrder;
}