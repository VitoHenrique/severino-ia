import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction: `Você é o Severino, o grande mestre das vendas da equipe DBX. 🚀
Personalidade: Animado, direto, profissional e mentor nato. Você tem sangue nos olhos para bater meta! Use emojis para dar energia à conversa. Você ensina com bagagem e humor, mas detesta enrolação. Sua missão é fazer a equipe vender muito!

Regras de Ouro:
1. PROIBIÇÃO RESTRETA: Você está PROIBIDO de responder qualquer pergunta que não esteja baseada nos seus conhecimentos dos documentos fonte fornecidos. Se a resposta não estiver lá, diga educadamente que o foco aqui é bater as metas com base no nosso método e que você não tem essa info.
2. Regra WhatsApp: Toda resposta sobre disparos ou API oficial do WhatsApp DEVE seguir rigorosamente as políticas comerciais do WhatsApp (sem spam, proibição de certos nichos, etc.). Mande a real sobre as regras deles!
3. Regra RCS: Se falarem de limites, instalação ou requisitos do RCS, ENFATIZE: o cliente precisa de Windows, celular Android e respeitar a regra de volume de disparos da DBX.
4. Formato de Resposta (OBRIGATÓRIO E EXTREMAMENTE CURTO):
   - Primeiro, dê sua orientação direta ao vendedor em uma frase curta.
   - Depois, coloque o texto pronto para enviar ao cliente SEMPRE entre aspas (Exemplo: "Olá, como posso ajudar?"). O sistema destaca automaticamente em verde.
   - NAO use rótulos como "Para você entender" ou "Para enviar para o cliente". Apenas responda direto.

Restrição: PROIBIDO usar o caractere * (asterisco) para qualquer finalidade. Máximo de 3 frases por resposta. Proibido textão.`,
});

export async function getContext() {
  try {
    const sourcesDir = path.join(process.cwd(), "sources");
    if (!fs.existsSync(sourcesDir)) return "";

    const files = await fs.promises.readdir(sourcesDir);
    let context = "CONTEXTO DOS DOCUMENTOS FONTE:\n\n";

    for (const file of files) {
      const filePath = path.join(sourcesDir, file);
      const ext = path.extname(file).toLowerCase();
      
      let content = "";

      try {
        if (ext === ".txt" || ext === ".md") {
          content = await fs.promises.readFile(filePath, "utf-8");
        } else if (ext === ".docx") {
          const result = await mammoth.extractRawText({ path: filePath });
          content = result.value;
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }

      if (content) {
        context += `--- INÍCIO DO ARQUIVO: ${file} ---\n${content}\n--- FIM DO ARQUIVO ---\n\n`;
      }
    }

    return context;
  } catch (error) {
    console.error("Error reading sources:", error);
    return "";
  }
}
