import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  processUpload,
  UploadValidationError,
  UPLOAD_POLICIES,
  type UploadPolicyKey,
} from "@/lib/upload";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 1. Auth + authorization first -- no public upload endpoint exists
  //    anywhere on the site (docs/05-frontend-architecture.md, checklist
  //    item 1).
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate-limit, even for an authenticated session (checklist item 8).
  const ip = getClientIp(request.headers);
  const limitResult = rateLimit(`upload:${session.user.id}:${ip}`, 20, 10 * 60 * 1000);
  if (!limitResult.success) {
    return NextResponse.json({ error: "Too many uploads, please slow down." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const policyKey = formData.get("policy") as UploadPolicyKey | null;
  const field = formData.get("field"); // e.g. "course.coverImage", for the audit log

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!policyKey || !(policyKey in UPLOAD_POLICIES)) {
    return NextResponse.json({ error: "Unknown upload policy." }, { status: 400 });
  }
  if (typeof field !== "string" || field.length === 0) {
    return NextResponse.json({ error: "Missing field identifier." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processUpload(buffer, policyKey);

    // 10. Log every upload -- who, when, filename mapping, size.
    await prisma.uploadLog.create({
      data: {
        adminUserId: session.user.id,
        originalName: file.name,
        storedFilename: result.storedFilename,
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        field,
      },
    });

    return NextResponse.json(result satisfies typeof result);
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
