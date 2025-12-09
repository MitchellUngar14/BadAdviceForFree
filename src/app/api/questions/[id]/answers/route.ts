import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, canAnswer } from "@/lib/auth";

// POST /api/questions/[id]/answers - Submit answer (Tier 2+)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);

    if (!payload || !canAnswer(payload.tier)) {
      return NextResponse.json(
        { error: "You must be Tier 2 or higher to answer questions" },
        { status: 403 }
      );
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const { body } = await request.json();

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Answer body is required" },
        { status: 400 }
      );
    }

    const answer = await prisma.answer.create({
      data: {
        body: body.trim(),
        questionId: params.id,
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

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error("Create answer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
