import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { anthropicClient } from "./anthropic";
import { InsertInterview, InsertQuestion, Question } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Get all interviews for the current user
  app.get("/api/interviews", isAuthenticated, async (req, res) => {
    try {
      const interviews = await storage.getInterviewsByUserId(req.user!.id);
      res.json(interviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific interview
  app.get("/api/interviews/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const interview = await storage.getInterview(id);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      // Ensure the interview belongs to the current user
      if (interview.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(interview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a new interview
  app.post("/api/interviews", isAuthenticated, async (req, res) => {
    try {
      const interviewData: InsertInterview = {
        ...req.body,
        userId: req.user!.id
      };
      
      const interview = await storage.createInterview(interviewData);
      res.status(201).json(interview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get questions for an interview
  app.get("/api/interviews/:id/questions", isAuthenticated, async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id, 10);
      const interview = await storage.getInterview(interviewId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      // Ensure the interview belongs to the current user
      if (interview.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const questions = await storage.getQuestionsByInterviewId(interviewId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate questions for an interview
  app.post("/api/interviews/:id/generate-questions", isAuthenticated, async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id, 10);
      const interview = await storage.getInterview(interviewId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      // Ensure the interview belongs to the current user
      if (interview.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check if questions already exist
      const existingQuestions = await storage.getQuestionsByInterviewId(interviewId);
      if (existingQuestions.length > 0) {
        return res.json(existingQuestions);
      }

      // Generate questions using Claude API
      const numQuestions = req.body.numQuestions || 5;
      const questions = await anthropicClient.generateQuestions(
        interview.role,
        interview.questionType,
        interview.difficulty,
        numQuestions
      );

      // Save questions to database
      const savedQuestions: Question[] = [];
      for (let i = 0; i < questions.length; i++) {
        const questionData: InsertQuestion = {
          interviewId,
          content: questions[i],
          type: interview.questionType,
          order: i + 1
        };
        const savedQuestion = await storage.createQuestion(questionData);
        savedQuestions.push(savedQuestion);
      }

      res.json(savedQuestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit an answer to a question
  app.post("/api/questions/:id/answer", isAuthenticated, async (req, res) => {
    try {
      const questionId = parseInt(req.params.id, 10);
      const { answer } = req.body;
      
      // Get the question
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Get the interview to verify ownership
      const interview = await storage.getInterview(question.interviewId);
      if (!interview || interview.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Evaluate the answer using Claude API
      const feedback = await anthropicClient.evaluateAnswer(
        question.content,
        answer,
        interview.role,
        question.type,
        interview.difficulty
      );

      // Update the question with the answer and feedback
      const updatedQuestion = await storage.updateQuestionAnswer(
        questionId,
        answer,
        feedback,
        feedback.overallScore
      );

      res.json(updatedQuestion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complete an interview
  app.post("/api/interviews/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id, 10);
      const interview = await storage.getInterview(interviewId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      // Ensure the interview belongs to the current user
      if (interview.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get all questions with scores
      const questions = await storage.getQuestionsByInterviewId(interviewId);
      const answeredQuestions = questions.filter(q => q.score !== null);
      
      // Calculate average score
      let averageScore = 0;
      if (answeredQuestions.length > 0) {
        const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
        averageScore = Math.round(totalScore / answeredQuestions.length);
      }

      // Update interview as completed with score
      const completedInterview = await storage.completeInterview(interviewId, averageScore);
      
      res.json(completedInterview);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
