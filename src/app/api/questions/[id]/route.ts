import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, canEdit, canModerate } from "@/lib/auth";

// GET /api/questions/[id] - Get single question with answers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            tier: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                tier: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Get question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/questions/[id] - Edit question (Tier 3 or owner)
export async function PUT(
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

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (!canEdit(payload.tier, payload.userId, question.userId)) {
      return NextResponse.json(
        { error: "You do not have permission to edit this question" },
        { status: 403 }
      );
    }

    const { title, body } = await request.json();

    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: {
        title: title?.trim() || question.title,
        body: body?.trim() || question.body,
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

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id] - Delete question (Tier 3 only)
export async function DELETE(
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

    if (!payload || !canModerate(payload.tier)) {
      return NextResponse.json(
        { error: "Only admins can delete questions" },
        { status: 403 }
      );
    }

    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Question deleted" });
  } catch (error) {
    console.error("Delete question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
