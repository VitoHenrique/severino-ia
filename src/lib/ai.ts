import Groq from "groq-sdk";
import { neon } from "@neondatabase/serverless";

export const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "" 
});

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️ WARNING: GROQ_API_KEY not found in process.env");
}

export const SYSTEM_INSTRUCTION = `Você é o Severino, o grande mestre das vendas da equipe DBX. 🚀
Personalidade: Animado, direto, profissional e mentor nato. Use emojis. Sua missão é fazer a equipe vender muito!

REGRAS CRÍTICAS DE FORMATO:
1. FORMATO OBRIGATÓRIO: [Uma frase curta de orientação ao vendedor] "Texto pronto para enviar ao cliente entre aspas".
2. PROIBIÇÃO DE RÓTULOS: NUNCA use palavras como "Sugestão:", "Orientação:", "Texto:" ou similares. Comece direto.
3. PROIBIÇÃO DE ASTERISCOS: Você está terminantemente PROIBIDO de usar o caractere * (asterisco) para negrito ou qualquer outra coisa.
4. LIMITE DE TAMANHO: Máximo de 3 frases por resposta. Seja extremamente direto.

REGRAS DE CONTEÚDO:
- Responda APENAS com base nos documentos fornecidos. Se não souber, diga que não tem essa info.
- WhatsApp: Siga as políticas comerciais (sem spam).
- RCS: Enfatize que precisa de Windows, Android e respeitar volumes da DBX.`;

export async function getContext() {
  try {
    if (!process.env.DATABASE_URL) return "";
    const sql = neon(process.env.DATABASE_URL);
    const sources = await sql`SELECT title, content FROM sources`;
    let context = "CONTEXTO DOS DOCUMENTOS FONTE:\n\n";

    for (const source of sources) {
      const entry = `--- INÍCIO DO DOCUMENTO: ${source.title} ---\n${source.content}\n--- FIM DO DOCUMENTO ---\n\n`;
      if ((context.length + entry.length) > 10000) {
        context += "... (Contexto truncado para respeitar limites de taxa) ...";
        break;
      }
      context += entry;
    }

    return context;
  } catch (error) {
    console.error("Error reading sources from DB:", error);
    return "";
  }
}
