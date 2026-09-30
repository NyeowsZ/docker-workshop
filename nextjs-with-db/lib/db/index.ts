import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
  quizInitialized: boolean | undefined;
};

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST || "node-db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "secret",
    database: process.env.DB_NAME || "nextdb",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });

export const DEFAULT_QUESTIONS = [
  {
    question: "What is Docker container ephemerality?",
    optionA: "Containers automatically sync their file state to cloud storage on shutdown.",
    optionB: "Changes made inside a container's writable layer are lost when the container is removed.",
    optionC: "Containers run solely in RAM and cannot write to disk.",
    optionD: "Docker images expire automatically after 30 days.",
    correctAnswer: "B",
    explanation: "Container filesystems are ephemeral by design. Any files written inside the container exist only in the writable layer and are deleted when the container is removed, unless mapped to a persistent Docker volume.",
    category: "Architecture",
  },
  {
    question: "Why should databases in Docker use volumes instead of the container layer?",
    optionA: "Volumes provide hardware GPU acceleration for query indexing.",
    optionB: "MySQL containers refuse to start without a host volume specified.",
    optionC: "Volumes persist data independently of container lifecycles on the host filesystem.",
    optionD: "Volumes automatically compress and encrypt all database tables.",
    correctAnswer: "C",
    explanation: "Docker volumes decouple data persistence from the container lifecycle, ensuring MySQL records remain intact even when containers are recreated or upgraded.",
    category: "Storage",
  },
  {
    question: "How do containers in the same user-defined bridge network resolve each other?",
    optionA: "Via Docker's embedded internal DNS that resolves container and service names.",
    optionB: "By broadcasting ARP queries across the host's physical network adapter.",
    optionC: "By hardcoding the host's localhost loopback IP.",
    optionD: "Through public DNS servers configured in /etc/resolv.conf.",
    correctAnswer: "A",
    explanation: "Docker provides an embedded DNS server on user-defined bridge networks (like node-net), allowing node-app to connect to node-db simply using its service name.",
    category: "Networking",
  },
  {
    question: "What is the primary difference between a Docker Image and a Docker Container?",
    optionA: "An image is an active runtime process; a container is a static configuration file.",
    optionB: "An image is a read-only immutable package; a container is a runnable instance with a writable layer.",
    optionC: "Images only execute on Linux kernels; containers run on any OS without emulation.",
    optionD: "Containers can be pushed to Docker Hub, while images remain local only.",
    correctAnswer: "B",
    explanation: "Images are immutable blueprints created at build time. Containers are isolated runtime instances executed from an image.",
    category: "Core Concepts",
  },
];

export async function ensureInitialized() {
  if (globalForDb.quizInitialized) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        option_a VARCHAR(500) NOT NULL,
        option_b VARCHAR(500) NOT NULL,
        option_c VARCHAR(500) NOT NULL,
        option_d VARCHAR(500) NOT NULL,
        correct_answer VARCHAR(10) NOT NULL,
        explanation TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'Docker Core',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM quiz_questions"
    );
    const count = rows[0]?.count ?? 0;

    if (count === 0) {
      for (const q of DEFAULT_QUESTIONS) {
        await pool.query(
          `INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, category)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.explanation, q.category]
        );
      }
    }

    globalForDb.quizInitialized = true;
  } catch (error) {
    console.error("Failed to initialize quiz_questions table:", error);
  }
}
