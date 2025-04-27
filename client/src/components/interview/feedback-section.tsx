import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackContent } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, Lightbulb, ArrowRight, Flag, Loader2 } from "lucide-react";

interface FeedbackSectionProps {
  feedback: any;
  onNext: () => void;
  isLastQuestion: boolean;
  isCompleting: boolean;
}

export function FeedbackSection({ 
  feedback, 
  onNext, 
  isLastQuestion,
  isCompleting
}: FeedbackSectionProps) {
  const feedbackContent = useMemo(() => {
    if (!feedback) return null;
    return feedback as FeedbackContent;
  }, [feedback]);

  if (!feedbackContent) {
    return null;
  }

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Feedback</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {feedbackContent.overallScore}%
            </span>
          </div>
          <Progress 
            value={feedbackContent.overallScore} 
            className="h-2.5 mt-1" 
            indicatorClassName={getScoreColor(feedbackContent.overallScore)}
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex">
            <Check className="text-green-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">Strengths</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside pl-1">
                {feedbackContent.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex">
            <AlertTriangle className="text-amber-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">Areas for Improvement</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside pl-1">
                {feedbackContent.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex">
            <Lightbulb className="text-blue-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">Suggested Answer Elements</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feedbackContent.suggestedAnswer}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
            <Flag className="h-4 w-4 mr-1" />
            Flag Question
          </Button>
          <Button onClick={onNext} disabled={isCompleting}>
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                {isLastQuestion ? "Complete Interview" : "Next Question"} 
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
