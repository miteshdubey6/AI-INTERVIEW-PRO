import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { InterviewSession } from "@/components/interview/interview-session";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Question, Interview } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function InterviewPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  // Get interview and its questions
  const { data: interview, isLoading: interviewLoading, error: interviewError } = useQuery<Interview>({
    queryKey: [`/api/interviews/${id}`],
  });

  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery<Question[]>({
    queryKey: [`/api/interviews/${id}/questions`],
    enabled: !!interview,
  });

  // Generate questions on first load if they don't exist
  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/interviews/${id}/generate-questions`, null);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${id}/questions`] });
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: number; answer: string }) => {
      const res = await apiRequest("POST", `/api/questions/${questionId}/answer`, { answer });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${id}/questions`] });
    },
  });

  // Complete interview mutation
  const completeInterviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/interviews/${id}/complete`, null);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      setLocation("/");
    },
  });

  // Check if questions need to be generated
  useEffect(() => {
    if (interview && questions && questions.length === 0 && !generateQuestionsMutation.isPending) {
      generateQuestionsMutation.mutate();
    }
  }, [interview, questions]);

  // Handle answer submission
  const handleSubmitAnswer = (questionId: number, answer: string) => {
    submitAnswerMutation.mutate({ questionId, answer });
  };

  // Handle interview completion
  const handleCompleteInterview = () => {
    completeInterviewMutation.mutate();
  };

  // Loading state
  if (interviewLoading || questionsLoading || (!questions && generateQuestionsMutation.isPending)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {generateQuestionsMutation.isPending ? "Generating questions..." : "Loading interview..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (interviewError || questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold">Error</h1>
            </div>
            <p className="text-muted-foreground mb-4">
              {interviewError?.message || questionsError?.message || "Failed to load interview"}
            </p>
            <Button onClick={() => setLocation("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If interview exists and questions are loaded
  if (interview && questions) {
    return (
      <InterviewSession
        interview={interview}
        questions={questions}
        onSubmitAnswer={handleSubmitAnswer}
        onComplete={handleCompleteInterview}
        isSubmitting={submitAnswerMutation.isPending}
        isCompleting={completeInterviewMutation.isPending}
      />
    );
  }

  return null;
}
