import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const modelName = "claude-3-7-sonnet-20250219";

export class AnthropicClient {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
  }
  
  // Method to update the API key during runtime
  updateApiKey(newApiKey: string): void {
    this.client = new Anthropic({
      apiKey: newApiKey,
    });
    console.log("Anthropic client updated with new API key");
  }

  async generateQuestions(role: string, type: string, difficulty: string, count: number): Promise<string[]> {
    const prompt = `Generate ${count} interview questions for a ${role} position. 
    The questions should be ${type} in nature and ${difficulty} difficulty level.
    Questions should be specific to the role and appropriate for the difficulty level.
    Format each question as a separate paragraph with no numbering or prefixes.`;

    try {
      // Check if we have a valid API key
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '') {
        throw new Error('No API key provided');
      }

      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      // Split the content by newlines and filter out empty lines
      const contentBlock = response.content[0];
      if (contentBlock.type !== 'text') {
        throw new Error('Unexpected response format from Anthropic API');
      }
      const content = contentBlock.text;
      return content.split('\n\n').filter((q: string) => q.trim());
    } catch (error: any) {
      console.error('Error generating questions:', error.message);
      
      // Return fallback questions based on role, type, and difficulty
      console.log(`Using fallback questions for ${role}, ${type}, ${difficulty}`);
      
      // Simple fallback questions for common roles
      const fallbackQuestions: Record<string, Record<string, Record<string, string[]>>> = {
        "software-engineer": {
          "technical": {
            "easy": [
              "Explain the difference between a stack and a queue data structure.",
              "What is the time complexity of searching in a sorted array?",
              "Describe the concept of inheritance in object-oriented programming.",
              "What is the difference between == and === in JavaScript?",
              "Explain what a RESTful API is and its key principles."
            ],
            "medium": [
              "Implement a function to check if a binary tree is balanced.",
              "Explain the concept of closure in JavaScript with an example.",
              "Describe the SOLID principles of object-oriented design.",
              "Compare and contrast promises and async/await in JavaScript.",
              "Explain the concept of database normalization and its benefits."
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
              "How do you handle feedback from peers or managers?",
              "Describe a situation where you had to work with a difficult team member.",
              "What's your approach to maintaining a healthy work-life balance?",
              "How do you prioritize tasks when you have multiple deadlines?"
            ],
            "medium": [
              "Describe a project where you had to implement a significant technical change.",
              "Tell me about a time when you had to make a difficult decision with limited information.",
              "How have you handled a situation where you disagreed with your manager's approach?",
              "Describe a time when you identified and resolved a technical debt issue.",
              "How do you approach mentoring junior developers on your team?"
            ],
            "hard": [
              "Tell me about a time when you led a project that failed. What did you learn?",
              "Describe a situation where you had to make an ethical decision in your work.",
              "How have you handled conflicting priorities between business needs and technical quality?",
              "Tell me about a time when you had to influence senior leadership on a technical decision.",
              "Describe a situation where you had to resolve a critical production issue under pressure."
            ]
          }
        },
        "ai-engineer": {
          "technical": {
            "easy": [
              "Explain the difference between supervised and unsupervised learning.",
              "What is the purpose of regularization in machine learning models?",
              "Describe the process of feature engineering and why it's important.",
              "What are the common evaluation metrics for classification problems?",
              "Explain how a neural network learns through backpropagation."
            ],
            "medium": [
              "Describe the architecture of a transformer model and how it processes text data.",
              "How would you handle imbalanced datasets in a machine learning problem?",
              "Explain the concept of attention mechanisms in deep learning.",
              "Describe approaches to fine-tuning large language models for specific tasks.",
              "How would you design an evaluation framework for a conversational AI system?"
            ],
            "hard": [
              "Design a recommendation system that balances exploration and exploitation.",
              "Explain how you would create an end-to-end ML pipeline for real-time predictions.",
              "How would you detect and mitigate bias in a large language model?",
              "Design an architecture for a multi-modal AI system that processes text, images, and audio.",
              "Describe your approach to optimizing inference latency in production ML systems."
            ]
          },
          "behavioral": {
            "easy": [
              "How do you stay updated with the latest developments in AI and machine learning?",
              "Describe a time when you had to explain a complex AI concept to a non-technical stakeholder.",
              "How do you approach validating the quality of data for an AI project?",
              "Tell me about a time when you had to balance model accuracy with computational efficiency.",
              "How do you collaborate with other teams when implementing AI solutions?"
            ],
            "medium": [
              "Describe a situation where your AI solution had unexpected behavior in production.",
              "Tell me about a time when you had to make trade-offs between model interpretability and performance.",
              "How have you handled ethical considerations in an AI project?",
              "Describe your approach to setting realistic expectations with stakeholders about AI capabilities.",
              "Tell me about a time when you had to overcome limited data for an AI project."
            ],
            "hard": [
              "Describe a time when you led a complex AI project from concept to production.",
              "How have you handled a situation where an AI system made a critical error affecting users?",
              "Tell me about a time when you had to decide between building a custom model versus using an existing solution.",
              "Describe how you've handled the uncertainty and research aspects of implementing cutting-edge AI techniques.",
              "How have you balanced innovation with reliability in AI systems that serve critical business functions?"
            ]
          }
        }
      };
      
      // Default to software-engineer if the role doesn't exist
      const roleQuestions = fallbackQuestions[role] || fallbackQuestions["software-engineer"];
      
      // Default to technical if the type doesn't exist
      const typeQuestions = roleQuestions[type] || roleQuestions["technical"];
      
      // Default to medium if the difficulty doesn't exist
      const difficultyQuestions = typeQuestions[difficulty] || typeQuestions["medium"];
      
      // Return requested number of questions
      return difficultyQuestions.slice(0, count);
    }
  }

  async evaluateAnswer(question: string, answer: string, role: string, type: string, difficulty: string): Promise<any> {
    const prompt = `You are an interview evaluation AI. Evaluate the following answer to the interview question.
    
Question: "${question}"

Answer: "${answer}"

Context:
- This is for a ${role} role
- This is a ${type} question
- The difficulty level is ${difficulty}

Provide a structured evaluation with the following:
1. Overall score (0-100) 
2. List of strengths (bullet points)
3. List of areas for improvement (bullet points)
4. Elements of a suggested answer

Format your response as a JSON object with these keys:
- overallScore: number
- strengths: string[]
- improvements: string[]
- suggestedAnswer: string`;

    try {
      // Check if we have a valid API key
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '') {
        throw new Error('No API key provided');
      }
      
      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: 2000,
        system: "You are an expert interviewer who provides fair, balanced feedback. Always output valid JSON.",
        messages: [{ role: 'user', content: prompt }],
      });

      const contentBlock = response.content[0];
      if (contentBlock.type !== 'text') {
        throw new Error('Unexpected response format from Anthropic API');
      }
      const content = contentBlock.text;
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error evaluating answer:', error.message);
      
      // Generate basic feedback based on the question type
      let feedback;
      if (type === 'technical') {
        feedback = this.generateTechnicalFeedback(answer);
      } else {
        feedback = this.generateBehavioralFeedback(answer);
      }
      
      console.log(`Using fallback feedback for ${role}, ${type}, ${difficulty}`);
      return feedback;
    }
  }
  
  // Helper method to generate basic technical feedback when API is unavailable
  private generateTechnicalFeedback(answer: string): any {
    const answerLength = answer.length;
    
    // Very basic metrics
    let score = 65; // Default medium score
    
    // Adjust score based on answer length (very simple heuristic)
    if (answerLength < 100) {
      score = Math.max(40, score - 15);
    } else if (answerLength > 300) {
      score = Math.min(85, score + 10);
    }
    
    // Check for code snippets (very basic detection)
    const hasCodeExample = answer.includes('```') || 
                          answer.includes('function') || 
                          answer.includes('class') ||
                          answer.includes('for (') ||
                          answer.includes('if (');
                          
    if (hasCodeExample) {
      score = Math.min(90, score + 5);
    }
    
    return {
      overallScore: score,
      strengths: [
        "Provided a response to the technical question",
        answerLength > 200 ? "Gave a detailed explanation" : "Attempted to address the question",
        hasCodeExample ? "Included code examples to illustrate the solution" : "Explained the concept"
      ].filter(Boolean),
      improvements: [
        answerLength < 150 ? "Could provide more detailed explanations" : null,
        !hasCodeExample ? "Consider including code examples to illustrate concepts" : null,
        "Focus on providing more specific technical details and examples",
        "Structure your answer with clear sections for better readability"
      ].filter(Boolean),
      suggestedAnswer: "A thorough answer would include explanations of key concepts, code examples where appropriate, discussion of trade-offs, and real-world applications or scenarios."
    };
  }
  
  // Helper method to generate basic behavioral feedback when API is unavailable
  private generateBehavioralFeedback(answer: string): any {
    const answerLength = answer.length;
    
    // Very basic scoring
    let score = 70; // Default medium-high score for behavioral
    
    // Adjust score based on answer length
    if (answerLength < 150) {
      score = Math.max(50, score - 10);
    } else if (answerLength > 350) {
      score = Math.min(90, score + 10);
    }
    
    // Check for STAR method components (very basic detection)
    const hasContext = answer.includes('situation') || answer.includes('context') || answer.includes('when I');
    const hasAction = answer.includes('I did') || answer.includes('my approach') || answer.includes('I took');
    const hasResult = answer.includes('result') || answer.includes('outcome') || answer.includes('learned');
    
    if (hasContext && hasAction && hasResult) {
      score = Math.min(95, score + 10);
    }
    
    return {
      overallScore: score,
      strengths: [
        "Provided a response to the behavioral question",
        answerLength > 250 ? "Gave a detailed answer with context" : "Attempted to address the question",
        hasContext ? "Included context/situation in the answer" : null,
        hasAction ? "Described actions taken" : null,
        hasResult ? "Mentioned results or outcomes" : null
      ].filter(Boolean),
      improvements: [
        !hasContext ? "Include more context about the specific situation" : null,
        !hasAction ? "Focus more on your specific actions and contributions" : null, 
        !hasResult ? "Clearly state the outcomes and what you learned" : null,
        "Structure your answer using the STAR method (Situation, Task, Action, Result)",
        answerLength < 200 ? "Provide more details about your experience" : null
      ].filter(Boolean),
      suggestedAnswer: "A strong behavioral answer typically follows the STAR method: describing the Situation or Task, detailing the Actions you took, and sharing the Results achieved. Include specific details and quantify results when possible."
    };
  }
}

export const anthropicClient = new AnthropicClient();
