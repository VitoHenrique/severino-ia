import pkg from "pg";
const { Client } = pkg;
import fs from "fs/promises";
import path from "path";

const DATABASE_URL = "postgresql://neondb_owner:npg_d51IGxnwJHCN@ep-wild-field-acpqu3q6-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function setup() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("Creating table...");
  await client.query(`
    CREATE TABLE IF NOT EXISTS sources (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log("Reading existing sources...");
  const sourcesDir = path.join(process.cwd(), "sources");
  try {
    const files = await fs.readdir(sourcesDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".txt" || ext === ".md") {
        const content = await fs.readFile(path.join(sourcesDir, file), "utf-8");
        console.log(`Inserting ${file}...`);
        await client.query(`
          INSERT INTO sources (title, content)
          VALUES ($1, $2)
          ON CONFLICT (title) DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP;
        `, [file, content]);
      }
    }
  } catch(e) { console.log("Sources dir missing or empty."); }
  console.log("Database setup complete!");
  await client.end();
  process.exit(0);
}
setup().catch(console.error);
