// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async ({ req }) => {
      // FIX: Add 'await' to auth()
      const { userId } = await auth();
      
      if (!userId) throw new Error("Unauthorized");
      return { uploaderId: userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.uploaderId, url: file.url, key: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;