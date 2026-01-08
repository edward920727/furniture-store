import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload complete for userId:", "test-user");
      console.log("file url", file.url)
      return { uploadedBy: "test-user" };
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

