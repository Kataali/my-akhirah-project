import { NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/lib/supabase/server";

const DEFAULT_BUCKET = "My Akhirah Project";
// 100 years in seconds (matches existing signed URLs in the project)
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 365 * 100;

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err: any) {
    const status = err?.message === "Forbidden" ? 403 : 401;
    return NextResponse.json(
      { error: err?.message || "Unauthorized" },
      { status }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = ((formData.get("folder") as string) || "uploads").replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided for upload." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Resolve exact bucket id/name and whether it is public or private
    let bucketName = DEFAULT_BUCKET;
    let isBucketPublic = false;
    const { data: buckets } = await admin.storage.listBuckets();
    if (buckets && buckets.length > 0) {
      const matched =
        buckets.find(
          (b) => b.name === DEFAULT_BUCKET || b.id === DEFAULT_BUCKET
        ) ??
        buckets.find(
          (b) =>
            b.name.toLowerCase() === DEFAULT_BUCKET.toLowerCase() ||
            b.id.toLowerCase() === DEFAULT_BUCKET.toLowerCase()
        );
      if (matched) {
        bucketName = matched.id;
        isBucketPublic = Boolean(matched.public);
      }
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue;

      const ext = file.name.includes(".")
        ? file.name.split(".").pop()?.toLowerCase() || "jpg"
        : "jpg";
      const baseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);

      const uniqueSuffix = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const filePath = `${folder}/${uniqueSuffix}-${baseName || "image"}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await admin.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload failed (${file.name}): ${uploadError.message}` },
          { status: 500 }
        );
      }

      if (isBucketPublic) {
        const {
          data: { publicUrl },
        } = admin.storage.from(bucketName).getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      } else {
        const { data: signedData, error: signError } = await admin.storage
          .from(bucketName)
          .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN);

        if (signError || !signedData?.signedUrl) {
          return NextResponse.json(
            {
              error: `Failed to generate signed URL (${file.name}): ${
                signError?.message || "Unknown error"
              }`,
            },
            { status: 500 }
          );
        }

        uploadedUrls.push(signedData.signedUrl);
      }
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unexpected error during file upload." },
      { status: 500 }
    );
  }
}
