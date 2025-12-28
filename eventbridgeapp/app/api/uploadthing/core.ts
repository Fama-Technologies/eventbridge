import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const f = createUploadthing();

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  if (!authToken) {
    throw new Error("Unauthorized");
  }

  const payload = await verifyToken(authToken);
  if (!payload) {
    throw new Error("Invalid token");
  }

  return payload;
}

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image uploaded for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),

  galleryImages: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Gallery image uploaded for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),

  verificationDocuments: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Verification document uploaded for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
