import { groq, getContext, SYSTEM_INSTRUCTION } from "@/lib/ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("--- START CHAT REQUEST ---");
    const { messages } = await req.json();
    console.log("Messages received:", messages?.length);
    
    if (!process.env.GROQ_API_KEY) {
      console.error("ERROR: GROQ_API_KEY is missing!");
    } else {
      console.log("GROQ_API_KEY exists (masked):", process.env.GROQ_API_KEY.substring(0, 6) + "...");
    }

    const lastMessage = messages[messages.length - 1].content;
    
    // Obter contexto dos documentos fonte
    console.log("Fetching context...");
    const context = await getContext();
    console.log("Context fetched, length:", context?.length || 0);

    const fullPrompt = context 
      ? `${context}\n\nPERGUNTA DO USUÁRIO: ${lastMessage}`
      : lastMessage;

    // Build history for Groq (OpenAI format)
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content
    }));

    console.log("Calling Groq SDK (model: llama-3.1-8b-instant)...");
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history,
        { role: "user", content: fullPrompt }
      ],
      model: "llama-3.1-8b-instant",
      stream: true,
    });
    console.log("Groq call successful, starting stream...");

    // Criar um ReadableStream para streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
        } catch (e) {
          console.error("Groq Stream error:", e);
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
    
    const isQuotaError = error?.message?.includes("429") || error?.status === 429;
    
    return new Response(JSON.stringify({ 
      error: isQuotaError ? "Quota Exceeded" : "Failed to fetch response", 
      message: isQuotaError 
        ? "O limite gratuito do Groq foi atingido. Por favor, aguarde um momento ou verifique sua conta no console.groq.com."
        : (error?.message || "Unknown error"),
      details: error?.stack || "No stack trace available"
    }), {
      status: isQuotaError ? 429 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
