import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const quizQuestions = mysqlTable("quiz_questions", {
  id: int("id").primaryKey().autoincrement(),
  question: text("question").notNull(),
  optionA: varchar("option_a", { length: 500 }).notNull(),
  optionB: varchar("option_b", { length: 500 }).notNull(),
  optionC: varchar("option_c", { length: 500 }).notNull(),
  optionD: varchar("option_d", { length: 500 }).notNull(),
  correctAnswer: varchar("correct_answer", { length: 10 }).notNull(), // 'A' | 'B' | 'C' | 'D'
  explanation: text("explanation"),
  category: varchar("category", { length: 100 }).default("Docker Core").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const dockerServices = mysqlTable("docker_services", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 100 }).default("latest").notNull(),
  port: varchar("port", { length: 100 }).default(""),
  status: varchar("status", { length: 50 }).default("running").notNull(),
  network: varchar("network", { length: 100 }).default("node-net").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;
export type DockerService = typeof dockerServices.$inferSelect;
export type NewDockerService = typeof dockerServices.$inferInsert;
