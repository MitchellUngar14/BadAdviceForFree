import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, canEdit, canModerate } from "@/lib/auth";

// PUT /api/answers/[id] - Edit answer (Tier 3 or owner)
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

    const answer = await prisma.answer.findUnique({
      where: { id: params.id },
    });

    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    if (!canEdit(payload.tier, payload.userId, answer.userId)) {
      return NextResponse.json(
        { error: "You do not have permission to edit this answer" },
        { status: 403 }
      );
    }

    const { body } = await request.json();

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Answer body is required" },
        { status: 400 }
      );
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id: params.id },
      data: { body: body.trim() },
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

    return NextResponse.json({ answer: updatedAnswer });
  } catch (error) {
    console.error("Update answer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/answers/[id] - Delete answer (Tier 3 only)
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
        { error: "Only admins can delete answers" },
        { status: 403 }
      );
    }

    await prisma.answer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Answer deleted" });
  } catch (error) {
    console.error("Delete answer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
