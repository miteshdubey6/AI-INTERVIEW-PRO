import { useState, useEffect } from "react";
import { Interview, Question } from "@shared/schema";
import { AnswerForm } from "./answer-form";
import { FeedbackSection } from "./feedback-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface InterviewSessionProps {
  interview: Interview;
  questions: Question[];
  onSubmitAnswer: (questionId: number, answer: string) => void;
  onComplete: () => void;
  isSubmitting: boolean;
  isCompleting: boolean;
}

export function InterviewSession({ 
  interview, 
  questions, 
  onSubmitAnswer,
  onComplete,
  isSubmitting,
  isCompleting
}: InterviewSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [, setLocation] = useLocation();

  // Handle empty questions array
  if (!questions || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Waiting for Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're having trouble generating questions. This could be due to a temporary API issue.
          </p>
          <Button onClick={() => setLocation("/")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswer = currentQuestion?.userAnswer;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    if (!hasAnswer && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, hasAnswer]);

  // Reset timer when moving to a new question
  useEffect(() => {
    setTimeLeft(300);
    setAnswer("");
  }, [currentQuestionIndex]);

  const handleSubmitAnswer = () => {
    if (answer.trim() && currentQuestion) {
      onSubmitAnswer(currentQuestion.id, answer);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBackToDashboard = () => {
    // Check if any questions have been answered
    const anyAnswered = questions.some(q => q.userAnswer);
    if (anyAnswered) {
      setShowConfirmExit(true);
    } else {
      setLocation("/");
    }
  };

  const confirmExit = () => {
    setLocation("/");
  };

  // Helper functions to convert values to display text
  const getRoleName = () => {
    const roles: Record<string, string> = {
      "software-engineer": "Software Engineer",
      "data-scientist": "Data Scientist",
      "ai-engineer": "AI Engineer",
      "web-developer": "Web Developer",
      "cyber-security": "Cyber Security",
      "devops": "DevOps Engineer",
      "analyst": "Business Analyst",
    };
    return roles[interview.role] || interview.role;
  };

  const getDifficultyLabel = () => {
    return interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1);
  };

  const getQuestionTypeLabel = () => {
    return interview.questionType.charAt(0).toUpperCase() + interview.questionType.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-4 py-3 md:px-6">
          <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="ml-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div>
            <span className={`text-sm font-medium ${timeLeft < 60 && !hasAnswer ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
              <span className="inline-block w-5 mr-1">⏱</span>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-medium text-primary dark:text-primary-400">{getRoleName()}</span>
            <span className="mx-2">•</span>
            <Badge variant={interview.questionType as any}>{getQuestionTypeLabel()}</Badge>
            <span className="mx-2">•</span>
            <Badge variant={interview.difficulty as any}>{getDifficultyLabel()}</Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {currentQuestion?.content}
          </h2>
        </div>

        {!hasAnswer ? (
          <AnswerForm 
            answer={answer} 
            setAnswer={setAnswer} 
            onSubmit={handleSubmitAnswer}
            isSubmitting={isSubmitting}
          />
        ) : (
          <FeedbackSection 
            feedback={currentQuestion?.feedback}
            onNext={handleNextQuestion}
            isLastQuestion={isLastQuestion}
            isCompleting={isCompleting}
          />
        )}
      </div>

      {/* Confirm exit dialog */}
      <Dialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Interview?</DialogTitle>
            <DialogDescription>
              Your progress in this interview will be saved, but any unanswered questions will not be scored. Are you sure you want to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmExit(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmExit}>
              Exit Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
