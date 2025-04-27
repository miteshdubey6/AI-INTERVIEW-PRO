import { users, interviews, questions } from "@shared/schema";
import type { User, InsertUser, Interview, InsertInterview, Question, InsertQuestion, FeedbackContent } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Interview methods
  getInterview(id: number): Promise<Interview | undefined>;
  getInterviewsByUserId(userId: number): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  completeInterview(id: number, score: number): Promise<Interview>;
  
  // Question methods
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByInterviewId(interviewId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestionAnswer(id: number, answer: string, feedback: FeedbackContent, score: number): Promise<Question>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private interviewStore: Map<number, Interview>;
  private questionStore: Map<number, Question>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private interviewIdCounter: number;
  private questionIdCounter: number;

  constructor() {
    this.userStore = new Map();
    this.interviewStore = new Map();
    this.questionStore = new Map();
    
    this.userIdCounter = 1;
    this.interviewIdCounter = 1;
    this.questionIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 1 day
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.userStore.set(id, user);
    return user;
  }

  // Interview methods
  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviewStore.get(id);
  }

  async getInterviewsByUserId(userId: number): Promise<Interview[]> {
    return Array.from(this.interviewStore.values())
      .filter(interview => interview.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = this.interviewIdCounter++;
    const interview: Interview = {
      ...insertInterview,
      id,
      score: null,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    this.interviewStore.set(id, interview);
    return interview;
  }

  async completeInterview(id: number, score: number): Promise<Interview> {
    const interview = await this.getInterview(id);
    if (!interview) {
      throw new Error(`Interview with id ${id} not found`);
    }
    const updatedInterview: Interview = {
      ...interview,
      completed: true,
      score,
    };
    this.interviewStore.set(id, updatedInterview);
    return updatedInterview;
  }

  // Question methods
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questionStore.get(id);
  }

  async getQuestionsByInterviewId(interviewId: number): Promise<Question[]> {
    return Array.from(this.questionStore.values())
      .filter(question => question.interviewId === interviewId)
      .sort((a, b) => a.order - b.order);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const question: Question = {
      ...insertQuestion,
      id,
      userAnswer: null,
      feedback: null,
      score: null,
    };
    this.questionStore.set(id, question);
    return question;
  }

  async updateQuestionAnswer(id: number, answer: string, feedback: FeedbackContent, score: number): Promise<Question> {
    const question = await this.getQuestion(id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }
    const updatedQuestion: Question = {
      ...question,
      userAnswer: answer,
      feedback,
      score,
    };
    this.questionStore.set(id, updatedQuestion);
    return updatedQuestion;
  }
}

export const storage = new MemStorage();
