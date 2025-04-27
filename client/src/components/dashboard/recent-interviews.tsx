import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Interview } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

interface RecentInterviewsProps {
  interviews: Interview[];
}

export function RecentInterviews({ interviews }: RecentInterviewsProps) {
  if (!interviews || interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground py-8">
            You haven't completed any interviews yet. Start a new interview to see your results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Recent Interviews</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {interviews.map((interview, index) => (
          <div 
            key={interview.id} 
            className={`py-4 ${index < interviews.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {getJobRoleLabel(interview.role)}
                </h4>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant={getQuestionTypeVariant(interview.questionType)}>
                    {getQuestionTypeLabel(interview.questionType)}
                  </Badge>
                  <Badge variant={getDifficultyVariant(interview.difficulty)}>
                    {getDifficultyLabel(interview.difficulty)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {format(new Date(interview.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {interview.score ? `${interview.score}%` : "N/A"}
                  </span>
                  {interview.score && interview.score >= 80 ? (
                    <ArrowUp className="ml-1 h-4 w-4 text-green-500" />
                  ) : interview.score ? (
                    <ArrowDown className="ml-1 h-4 w-4 text-red-500" />
                  ) : null}
                </div>
                <Link href={`/interview/${interview.id}`}>
                  <Button variant="link" className="mt-2 h-auto p-0 text-sm text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      {interviews.length > 0 && (
        <CardFooter className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link href="/interviews">
            <Button variant="link" className="w-full text-sm text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              View All Interviews
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper functions to get display values
function getJobRoleLabel(value: string): string {
  const roles: Record<string, string> = {
    "software-engineer": "Software Engineer",
    "data-scientist": "Data Scientist",
    "ai-engineer": "AI Engineer",
    "web-developer": "Web Developer",
    "cyber-security": "Cyber Security",
    "devops": "DevOps Engineer",
    "analyst": "Business Analyst",
  };
  return roles[value] || value;
}

function getQuestionTypeLabel(value: string): string {
  const types: Record<string, string> = {
    "technical": "Technical",
    "behavioral": "Behavioral",
    "mixed": "Mixed",
  };
  return types[value] || value;
}

function getDifficultyLabel(value: string): string {
  const difficulties: Record<string, string> = {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
  };
  return difficulties[value] || value;
}

function getQuestionTypeVariant(type: string): "technical" | "behavioral" | "mixed" | "default" {
  if (type === "technical") return "technical";
  if (type === "behavioral") return "behavioral";
  if (type === "mixed") return "mixed";
  return "default";
}

function getDifficultyVariant(difficulty: string): "easy" | "medium" | "hard" | "default" {
  if (difficulty === "easy") return "easy";
  if (difficulty === "medium") return "medium";
  if (difficulty === "hard") return "hard";
  return "default";
}
