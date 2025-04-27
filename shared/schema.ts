import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(),
  difficulty: text("difficulty").notNull(),
  questionType: text("question_type").notNull(),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const insertInterviewSchema = createInsertSchema(interviews).pick({
  userId: true,
  role: true,
  difficulty: true,
  questionType: true,
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  userAnswer: text("user_answer"),
  feedback: json("feedback"),
  score: integer("score"),
  order: integer("order").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  interviewId: true,
  content: true,
  type: true,
  order: true,
});

export const roleOptions = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "ai-engineer", label: "AI Engineer" },
  { value: "web-developer", label: "Web Developer" },
  { value: "cyber-security", label: "Cyber Security" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "analyst", label: "Business Analyst" },
];

export const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const questionTypeOptions = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "mixed", label: "Mixed" },
];

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type InterviewWithStats = Interview & {
  questions: Array<Question>;
};

export type FeedbackContent = {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
};
