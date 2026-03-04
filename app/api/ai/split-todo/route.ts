import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { messages, todoId } = await req.json();

    const { db } = await connectToDatabase();
    const todosCollection = db.collection("todos");
    const todo = await todosCollection.findOne({
      _id: new ObjectId(todoId),
      $or: [{ userId: payload.userId }, { assignedTo: payload.userId }],
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    const systemPrompt = `You are a helpful AI assistant built to help users split down large tasks into smaller, manageable sub-todos.
The user is currently looking at a todo titled: "${todo.title}".
Description: "${todo.description || "No description provided"}".
Due Date for the main todo: ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "No due date"}.

Your goal is to converse with the user and help them figure out the best way to split this task up.
When the user is ready, use the \`save_subtasks\` tool to save the agreed-upon subtasks to the database.
Always include a title, an optional brief description, and an optional suggested due date (in ISO format) for each subtask.
Make sure the suggested due dates are logical and before the main task's due date (if it has one).
If the user specifically asks to split the task NOW, use the \`save_subtasks\` tool immediately.`;

    const result = streamText({
      model: google("gemini-1.5-pro"),
      system: systemPrompt,
      messages,
      tools: {
        save_subtasks: tool({
          description:
            "Save the generated subtasks to the database for this specific todo. Call this when the user is satisfied with the breakdown or explicitly asks you to split the task.",
          parameters: z.object({
            subtasks: z.array(
              z.object({
                title: z.string().describe("The title of the subtask"),
                description: z
                  .string()
                  .describe("A brief description of what to do"),
                dueDate: z
                  .string()
                  .optional()
                  .describe(
                    "Suggested due date in ISO format (e.g., 2024-05-15T12:00:00Z)",
                  ),
              }),
            ),
          }),
          execute: async ({
            subtasks,
          }: {
            subtasks: Array<{
              title: string;
              description: string;
              dueDate?: string;
            }>;
          }) => {
            const newSubtasks = subtasks.map((st, index) => ({
              id: new ObjectId().toString(),
              title: st.title,
              description: st.description,
              dueDate: st.dueDate,
              completed: false,
              generatedByAI: true,
              order: ((todo.subtasks as any[])?.length || 0) + index + 1,
            }));

            await todosCollection.updateOne(
              { _id: new ObjectId(todoId) },
              { $push: { subtasks: { $each: newSubtasks } } as any },
            );

            return {
              success: true,
              message: `Successfully saved ${newSubtasks.length} subtasks to the database.`,
              savedSubtasks: newSubtasks,
            };
          },
        } as any),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Split error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
