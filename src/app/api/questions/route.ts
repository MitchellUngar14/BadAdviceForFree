import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, canAskQuestion } from "@/lib/auth";

// GET /api/questions - List all questions (public)
export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            tier: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create question (Tier 1+)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload || !canAskQuestion(payload.tier)) {
      return NextResponse.json(
        { error: "You must be Tier 1 or higher to ask questions" },
        { status: 403 }
      );
    }

    const { title, body } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Question title is required" },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        title: title.trim(),
        body: body?.trim() || null,
        userId: payload.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            tier: true,
          },
        },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
