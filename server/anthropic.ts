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
      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      // Split the content by newlines and filter out empty lines
      const content = response.content[0].text;
      return content.split('\n\n').filter(q => q.trim());
    } catch (error: any) {
      console.error('Error generating questions:', error.message);
      throw new Error(`Failed to generate questions: ${error.message}`);
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
      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: 2000,
        system: "You are an expert interviewer who provides fair, balanced feedback. Always output valid JSON.",
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].text;
      return JSON.parse(content);
    } catch (error: any) {
      console.error('Error evaluating answer:', error.message);
      // Return a default response in case of error
      return {
        overallScore: 50,
        strengths: ["The candidate attempted to answer the question"],
        improvements: ["Technical error occurred during evaluation"],
        suggestedAnswer: "We couldn't analyze this answer properly due to a technical issue."
      };
    }
  }
}

export const anthropicClient = new AnthropicClient();
