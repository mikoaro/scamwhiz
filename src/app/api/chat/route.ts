import { NextResponse } from "next/server";
import { reportsIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { OpenAIStream, StreamingTextResponse, convertToCoreMessages, streamText } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

const modelName = "gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await reportsIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantReports = await prisma.report.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant reports found: ", relevantReports);

    const systemMessage: ChatCompletionMessage = {
      role: "system",
      content:
        "You are an intelligent scam reporting and scam finder app. You answer the user's question based on their existing reports. " +
        "The relevant reports for this query are:\n" +
        relevantReports
          .map((report) => `Title: ${report.title}\n\nContent:\n${report.content}`)
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: modelName,
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

