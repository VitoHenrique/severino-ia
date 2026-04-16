import { model, getContext } from "@/lib/gemini";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    
    // Obter contexto dos documentos fonte
    const context = await getContext();
    const promptWithContext = context 
      ? `${context}\n\nPERGUNTA DO USUÁRIO: ${lastMessage}`
      : lastMessage;

    // Build history: Gemini requires it to start with 'user' and alternate user/model.
    // We skip the last message (current user prompt) and any leading non-user messages.
    const historyMessages = messages.slice(0, -1);
    const firstUserIndex = historyMessages.findIndex(
      (m: { role: string; content: string }) => m.role === "user"
    );
    const validHistory = firstUserIndex >= 0 ? historyMessages.slice(firstUserIndex) : [];

    const chat = model.startChat({
      history: validHistory.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessageStream(promptWithContext);

    // Criar um ReadableStream para streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
        } catch (e) {
          console.error("Stream reader error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("--- CHAT ERROR DEBUG ---");
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Stack:", error?.stack);
    console.error("-------------------------");
    
    return new Response(JSON.stringify({ 
      error: "Failed to fetch response", 
      message: error?.message || "Unknown error",
      details: error?.stack || "No stack trace available"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
