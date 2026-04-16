import { GoogleGenerativeAI } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("Testing Database URL...");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("❌ DATABASE_URL missing");
  } else {
    try {
      const sql = neon(dbUrl);
      const res = await sql`SELECT 1 as connected`;
      console.log("✅ DB Connected:", res);
    } catch (e) {
      console.log("❌ DB Connection failed:", e.message);
    }
  }

  console.log("\nTesting Gemini API Key...");
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.log("❌ GOOGLE_GENERATIVE_AI_API_KEY missing");
  } else {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent("Respond 'OK' if you see this.");
      console.log("✅ Gemini Response:", result.response.text());
    } catch (e) {
      console.log("❌ Gemini API failed:", e.message);
    }
  }
}

test();
