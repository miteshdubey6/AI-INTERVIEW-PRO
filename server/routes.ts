import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { anthropicClient } from "./anthropic";
import { InsertInterview, InsertQuestion, Question, FeedbackContent } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

// Fallback functions for when the API key is not available

/**
 * Generate fallback questions when the AI API is not available
 */
function generateFallbackQuestions(
  role: string,
  type: string,
  difficulty: string,
  count: number
): string[] {
  const questions: Record<string, Record<string, Record<string, string[]>>> = {
    "software-engineer": {
      "technical": {
        "easy": [
          "Explain the difference between a stack and a queue data structure.",
          "What is the time complexity of searching in a binary search tree?",
          "Describe the concept of inheritance in object-oriented programming.",
          "What is the difference between == and === in JavaScript?",
          "Explain what a RESTful API is and its key principles."
        ],
        "medium": [
          "Implement a function to check if a binary tree is balanced.",
          "Explain the concept of closure in JavaScript with an example.",
          "Describe the SOLID principles of object-oriented design.",
          "What are promises in JavaScript and how do they work?",
          "Explain the concept of database normalization."
        ],
        "hard": [
          "Design a distributed system for a real-time chat application.",
          "Implement an LRU cache with O(1) time complexity for both get and put operations.",
          "Explain how you would design a scalable microservice architecture.",
          "Discuss strategies for handling race conditions in multi-threaded applications.",
          "Implement a solution for the traveling salesman problem."
        ]
      },
      "behavioral": {
        "easy": [
          "Tell me about a time when you had to learn a new technology quickly.",
          "How do you prioritize your work when you have multiple deadlines?",
          "Describe a situation where you had to work with a difficult team member.",
          "How do you stay updated with the latest technology trends?",
          "Tell me about a project you're most proud of."
        ],
        "medium": [
          "Describe a time when you had to make a difficult technical decision.",
          "Tell me about a situation where you disagreed with a team member. How did you resolve it?",
          "How have you handled a situation where requirements changed mid-project?",
          "Describe a time when you had to deal with ambiguity in a project.",
          "Tell me about a time when you failed at something. What did you learn?"
        ],
        "hard": [
          "Describe a situation where you led a team through a challenging technical problem.",
          "Tell me about a time when you had to make an unpopular decision.",
          "How have you handled conflicts between business requirements and technical constraints?",
          "Describe a time when you had to influence senior leadership on a technical matter.",
          "Tell me about a situation where you had to overcome significant obstacles to deliver a project."
        ]
      },
      "mixed": {
        "easy": [
          "What programming languages are you proficient in and why do you prefer them?",
          "How do you ensure your code is maintainable and readable?",
          "Tell me about a time when you had to debug a particularly challenging issue.",
          "What is your approach to testing your code?",
          "How do you collaborate with other developers in your team?"
        ],
        "medium": [
          "Describe your experience with CI/CD pipelines and how they improve the development process.",
          "How do you balance quality and speed when developing software?",
          "Tell me about a time when you had to refactor a large codebase. What was your approach?",
          "How do you handle technical debt in your projects?",
          "Describe a situation where you had to optimize a slow-performing application."
        ],
        "hard": [
          "How would you design a system that needs to handle millions of concurrent users?",
          "Describe your approach to ensuring security in the applications you build.",
          "Tell me about a time when you had to make architectural decisions that would affect the long-term evolution of a product.",
          "How do you approach learning a completely new technology stack for a project?",
          "Describe your experience with mentoring junior developers and helping them grow."
        ]
      }
    },
    "data-scientist": {
      "technical": {
        "easy": [
          "Explain the difference between supervised and unsupervised learning.",
          "What is the purpose of cross-validation in a machine learning model?",
          "Explain the concept of overfitting and how to prevent it.",
          "What is the difference between correlation and causation?",
          "Describe the process of data cleaning and why it's important."
        ],
        "medium": [
          "Explain the working of a random forest algorithm.",
          "How would you handle imbalanced datasets in classification problems?",
          "Explain the concept of regularization in machine learning models.",
          "What are the assumptions of linear regression?",
          "Describe the difference between bagging and boosting algorithms."
        ],
        "hard": [
          "Implement an algorithm to detect anomalies in time series data.",
          "Explain how you would build a recommendation system for a streaming platform.",
          "How would you approach building a model to predict customer churn?",
          "Describe the architecture of a transformer model and its advantages.",
          "How would you design a real-time fraud detection system?"
        ]
      },
      "behavioral": {
        "easy": [
          "Tell me about a data analysis project you've worked on.",
          "How do you explain complex data concepts to non-technical stakeholders?",
          "Describe a situation where you had to work with messy or incomplete data.",
          "How do you stay updated with the latest trends in data science?",
          "Tell me about a time when you had to collaborate with domain experts."
        ],
        "medium": [
          "Describe a situation where your data analysis led to a significant business decision.",
          "Tell me about a time when you had to adjust your analysis based on feedback.",
          "How have you handled situations where your findings didn't match stakeholder expectations?",
          "Describe a time when you had to work under tight deadlines for a data project.",
          "Tell me about a time when you identified a new opportunity through data analysis."
        ],
        "hard": [
          "Describe a situation where you had to influence business strategy based on your data analysis.",
          "Tell me about a time when you had to design and implement a complex data pipeline.",
          "How have you handled ethical considerations in your data science work?",
          "Describe a time when you had to lead a cross-functional data science project.",
          "Tell me about a situation where you had to balance model complexity with interpretability."
        ]
      },
      "mixed": {
        "easy": [
          "What tools and programming languages do you use for data analysis?",
          "How do you approach exploratory data analysis for a new dataset?",
          "Tell me about a time when you had to present data findings to stakeholders.",
          "What is your approach to feature selection in a model?",
          "How do you ensure the reproducibility of your analysis?"
        ],
        "medium": [
          "Describe your experience with deploying machine learning models to production.",
          "How do you balance model accuracy with computational efficiency?",
          "Tell me about a time when you had to work with big data technologies.",
          "How do you approach A/B testing in your data analysis projects?",
          "Describe a situation where you had to optimize a data pipeline for performance."
        ],
        "hard": [
          "How would you design a system to process and analyze real-time streaming data?",
          "Describe your approach to ensuring fairness and reducing bias in machine learning models.",
          "Tell me about a time when you had to develop a custom algorithm for a specific problem.",
          "How do you approach building interpretable models for high-stakes decisions?",
          "Describe your experience with implementing MLOps practices in an organization."
        ]
      }
    },
    "ai-engineer": {
      "technical": {
        "easy": [
          "What are the key differences between traditional machine learning and deep learning?",
          "Explain how backpropagation works in neural networks.",
          "What is the purpose of activation functions in neural networks?",
          "Explain the concept of word embeddings in NLP.",
          "What are the basic components of a convolutional neural network?"
        ],
        "medium": [
          "Explain the architecture of a transformer model.",
          "How would you handle class imbalance in a computer vision task?",
          "Describe the working of LSTM and its advantages over RNNs.",
          "Explain how attention mechanisms work in transformer models.",
          "What techniques would you use for hyperparameter optimization in deep learning models?"
        ],
        "hard": [
          "How would you design and implement a multimodal AI system?",
          "Explain the challenges in fine-tuning large language models and how to address them.",
          "Describe how you would implement a reinforcement learning solution for a robotics problem.",
          "How would you approach building a self-supervised learning system for image recognition?",
          "Explain how you would design an AI system that can detect and mitigate hallucinations in generated content."
        ]
      },
      "behavioral": {
        "easy": [
          "Tell me about an AI project you've worked on that you're particularly proud of.",
          "How do you stay updated with the rapid advancements in AI?",
          "Describe a situation where you had to explain complex AI concepts to non-technical stakeholders.",
          "How do you approach evaluating the performance of an AI model?",
          "Tell me about a time when you had to collaborate with subject matter experts."
        ],
        "medium": [
          "Describe a situation where you had to make tradeoffs between model accuracy and computational efficiency.",
          "Tell me about a time when you had to debug a complex issue in an AI system.",
          "How have you handled situations where your AI model didn't meet performance expectations?",
          "Describe a time when you had to work under tight deadlines for an AI project.",
          "Tell me about a situation where you had to pivot your approach based on unexpected results."
        ],
        "hard": [
          "Describe a situation where you had to lead a team in developing a complex AI solution.",
          "Tell me about a time when you had to address ethical concerns in an AI project.",
          "How have you handled privacy considerations when working with sensitive data?",
          "Describe a time when you had to balance business requirements with technical limitations in an AI system.",
          "Tell me about a situation where you had to advocate for responsible AI practices."
        ]
      },
      "mixed": {
        "easy": [
          "What deep learning frameworks are you most familiar with and why?",
          "How do you approach data preprocessing for AI models?",
          "Tell me about your experience with transfer learning.",
          "What is your approach to validating and testing AI models?",
          "How do you ensure your AI systems are robust and reliable?"
        ],
        "medium": [
          "Describe your experience with deploying AI models to production.",
          "How do you handle versioning and reproducibility in AI experiments?",
          "Tell me about a time when you had to optimize an AI model for resource-constrained environments.",
          "How do you approach explainability in AI systems?",
          "Describe a situation where you had to implement model monitoring for an AI system."
        ],
        "hard": [
          "How would you design an AI system that can continually learn and adapt over time?",
          "Describe your approach to ensuring fairness and reducing bias in AI models.",
          "Tell me about your experience with implementing AI governance frameworks.",
          "How do you approach building AI systems that can handle ambiguity and uncertainty?",
          "Describe your experience with developing custom architectures for specific AI problems."
        ]
      }
    }
  };

  // Default to software-engineer if role doesn't exist
  const roleQuestions = questions[role] || questions["software-engineer"];
  
  // Default to technical if type doesn't exist
  const typeQuestions = roleQuestions[type] || roleQuestions["technical"];
  
  // Default to medium if difficulty doesn't exist
  const difficultyQuestions = typeQuestions[difficulty] || typeQuestions["medium"];
  
  // Return requested number of questions (or all available if fewer than requested)
  return difficultyQuestions.slice(0, count);
}

/**
 * Generate fallback feedback when the AI API is not available
 */
function generateFallbackFeedback(
  question: string,
  answer: string,
  role: string,
  type: string,
  difficulty: string
): FeedbackContent {
  // Determine score based on answer length and complexity
  let score = 70; // Default to a moderately good score
  
  // Very simple heuristic: longer answers tend to be more thorough
  if (answer.length > 500) {
    score += 10;
  } else if (answer.length < 100) {
    score -= 20;
  }
  
  // Check for some basic indicators of a good answer
  const keywords = ["example", "experience", "challenge", "solution", "result", "learned"];
  const keywordCount = keywords.filter(word => 
    answer.toLowerCase().includes(word)
  ).length;
  
  score += keywordCount * 3; // Bonus for each keyword
  
  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  // Generate appropriate feedback based on the score
  let strengths = [];
  let improvements = [];
  
  if (score >= 80) {
    strengths = [
      "Provided a comprehensive answer with good detail",
      "Demonstrated clear understanding of the concepts involved",
      "Included relevant examples to support points made"
    ];
    improvements = [
      "Could provide more specific details in some areas",
      "Consider addressing potential edge cases or limitations",
      "Adding quantifiable outcomes would strengthen the answer"
    ];
  } else if (score >= 60) {
    strengths = [
      "Covered the main points of the question",
      "Showed basic understanding of the key concepts",
      "Structured the answer in a logical manner"
    ];
    improvements = [
      "Elaborate more on key concepts to show deeper understanding",
      "Include specific examples to illustrate your points",
      "Consider addressing the question from multiple perspectives",
      "Provide more context to demonstrate broader knowledge"
    ];
  } else {
    strengths = [
      "Attempted to address the question",
      "Included some relevant terminology",
      "Showed willingness to tackle the challenge"
    ];
    improvements = [
      "Focus more directly on answering the specific question asked",
      "Expand your answer with more technical details and examples",
      "Structure your response more clearly with a beginning, middle, and conclusion",
      "Demonstrate deeper understanding of the fundamental concepts involved",
      "Include practical examples to support theoretical knowledge"
    ];
  }
  
  // Generate a suggested answer based on the question type
  let suggestedAnswer = "";
  
  if (type === "technical") {
    suggestedAnswer = "A strong answer would include: clear explanation of relevant concepts, specific technical details, examples of practical application, discussion of advantages and limitations, and demonstration of deep understanding through precise terminology.";
  } else if (type === "behavioral") {
    suggestedAnswer = "A strong answer would follow the STAR method (Situation, Task, Action, Result), include specific details about your role and contributions, highlight skills relevant to the role, quantify results where possible, and reflect on lessons learned.";
  } else {
    suggestedAnswer = "A strong answer would combine technical knowledge with practical experience, demonstrate both hard and soft skills, include specific examples from your work, show problem-solving ability, and connect your experience to the requirements of the role.";
  }
  
  return {
    overallScore: score,
    strengths,
    improvements,
    suggestedAnswer
  };
}

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
      let questions = [];
      
      try {
        // Check if we have a valid API key
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === '') {
          console.log("No API key found, using fallback questions");
          throw new Error("No API key provided");
        }
        
        questions = await anthropicClient.generateQuestions(
          interview.role,
          interview.questionType,
          interview.difficulty,
          numQuestions
        );
        
        console.log(`Successfully generated ${questions.length} questions with Anthropic API`);
      } catch (error) {
        console.error("Error generating questions with Anthropic API:", error);
        
        // Fallback questions based on role, type, and difficulty
        console.log(`Using fallback questions for ${interview.role}, ${interview.questionType}, ${interview.difficulty}`);
        questions = generateFallbackQuestions(
          interview.role,
          interview.questionType, 
          interview.difficulty,
          numQuestions
        );
        
        console.log(`Generated ${questions.length} fallback questions`);
      }

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
      let feedback;
      try {
        // Check if we have a valid API key
        if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === '') {
          console.log("No API key found, using fallback evaluation");
          throw new Error("No API key provided");
        }
        
        feedback = await anthropicClient.evaluateAnswer(
          question.content,
          answer,
          interview.role,
          question.type,
          interview.difficulty
        );
        
        console.log("Successfully evaluated answer with Anthropic API");
      } catch (error) {
        console.error("Error evaluating answer with Anthropic API:", error);
        
        // Generate fallback feedback
        console.log(`Using fallback evaluation for ${interview.role}, ${question.type}, ${interview.difficulty}`);
        feedback = generateFallbackFeedback(
          question.content, 
          answer, 
          interview.role, 
          question.type, 
          interview.difficulty
        );
        
        console.log("Generated fallback evaluation feedback");
      }

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
  
  // Update API key
  app.post("/api/update-api-key", isAuthenticated, (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "Invalid API key format" });
      }
      
      // Only allow API keys that start with sk-ant- for Anthropic
      if (!apiKey.startsWith('sk-ant-')) {
        return res.status(400).json({ message: "Invalid API key format. Anthropic keys start with 'sk-ant-'" });
      }
      
      // Update the environment variable
      process.env.ANTHROPIC_API_KEY = apiKey;
      
      // Recreate the Anthropic client with the new key
      anthropicClient.updateApiKey(apiKey);
      
      res.status(200).json({ message: "API key updated successfully" });
    } catch (error: any) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Check if Anthropic API key is valid
  app.get("/api/check-api-key", async (req, res) => {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      // Check if API key exists
      if (!apiKey) {
        return res.status(400).json({ 
          valid: false, 
          message: "No API key set" 
        });
      }
      
      // Validate API key format
      if (!apiKey.startsWith('sk-ant-')) {
        return res.status(400).json({ 
          valid: false, 
          message: "Invalid API key format. Anthropic keys start with 'sk-ant-'" 
        });
      }
      
      // Test the API key with a simple request
      try {
        // Make a simple request to test the API key
        await anthropicClient.generateQuestions("software-engineer", "technical", "easy", 1);
        res.json({ valid: true, message: "API key is valid" });
      } catch (error: any) {
        console.error("Error testing Anthropic API key:", error);
        res.status(400).json({ 
          valid: false, 
          message: `API key validation failed: ${error.message}` 
        });
      }
    } catch (error: any) {
      console.error("Error checking API key:", error);
      res.status(500).json({ 
        valid: false, 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
