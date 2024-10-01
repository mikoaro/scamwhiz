import { reportsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createReportSchema,
  deleteReportSchema,
  updateReportSchema,
} from "@/lib/validation/report";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parseResult = createReportSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForReport(title, content);

    const report = await prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          title,
          content,
          userId,
        },
      });

      await reportsIndex.upsert([
        {
          id: report.id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return report;
    });

    return Response.json({ report }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const parseResult = updateReportSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, title, content } = parseResult.data;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== report.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForReport(title, content);

    const updatedReport = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      await reportsIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return updatedReport;
    });

    return Response.json({ updatedReport }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const parseResult = deleteReportSchema.safeParse(body);

    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parseResult.data;

    const report = await prisma.report.findUnique({ where: { id } });

    if (!report) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== report.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.report.delete({ where: { id } });
      await reportsIndex.deleteOne(id);
    });

    return Response.json({ message: "Report deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmbeddingForReport(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + content ?? "");
}
