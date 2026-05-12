import { client } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

function getClientIp(req: NextRequest): string {
  const raw =
    req.headers.get("x-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip");

  const ip = raw?.split(",")[0]?.trim();
  return ip || "127.0.0.1";
}

function coercePostId(postId: unknown): number | null {
  if (typeof postId === "number" && Number.isFinite(postId)) return postId;
  if (typeof postId === "string") {
    const parsed = Number.parseInt(postId, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const postIdNumber = coercePostId(postId);

    if (postIdNumber === null) {
      return NextResponse.json({ error: "postId must be a number" }, { status: 400 });
    }

    const existingLike = await client.db.like.findUnique({
      where: {
        postId_userIP: { postId: postIdNumber, userIP: ip },
      },
    });

    return NextResponse.json({ hasLiked: !!existingLike });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();
    const ip = getClientIp(req);
    const postIdNumber = coercePostId(postId);

    if (postIdNumber === null) {
      return NextResponse.json({ error: "postId must be a number" }, { status: 400 });
    }

    const existingLike = await client.db.like.findUnique({
      where: {
        postId_userIP: { postId: postIdNumber, userIP: ip },
      },
    });

    if (existingLike) {
      return NextResponse.json({ success: true, alreadyLiked: true });
    }

    await client.db.like.create({
      data: { postId: postIdNumber, userIP: ip },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId } = await req.json();
    const ip = getClientIp(req);
    const postIdNumber = coercePostId(postId);

    if (postIdNumber === null) {
      return NextResponse.json({ error: "postId must be a number" }, { status: 400 });
    }

    await client.db.like.deleteMany({
      where: { postId: postIdNumber, userIP: ip },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
