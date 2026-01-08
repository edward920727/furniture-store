import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ metadata, file }) => {
     console.log("Upload complete for userId:", (metadata as any).userId);
      console.log("file url", file.url)
      return { uploadedBy: (metadata as any)?.userId };
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
