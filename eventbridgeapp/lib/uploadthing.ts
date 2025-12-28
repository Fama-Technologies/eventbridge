import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const f = createUploadthing();

/**
 * Authenticate user using auth-token cookie
 */
async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  if (!authToken) {
    throw new Error("Unauthorized");
  }

  const payload = await verifyToken(authToken);

  if (!payload || !payload.userId) {
    throw new Error("Invalid token");
  }

  return payload;
}

/**
 * UploadThing File Router
 */
export const ourFileRouter = {
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
        uploadedBy: metadata.userId,
      };
    }),

  galleryImages: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
        uploadedBy: metadata.userId,
      };
    }),

  verificationDocuments: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      const user = await getAuthenticatedUser();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

/**
 * Export router type for client helpers
 */
export type OurFileRouter = typeof ourFileRouter;
