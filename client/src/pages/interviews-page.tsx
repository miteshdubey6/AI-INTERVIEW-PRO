import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { InterviewSetupModal } from "@/components/interview/interview-setup-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertInterview, Interview } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, PlayCircle, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function InterviewsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["/api/interviews"],
    enabled: !!user?.id,
  }) as { data: Interview[] | undefined; isLoading: boolean };

  const createInterviewMutation = useMutation({
    mutationFn: async (interviewData: Omit<InsertInterview, "userId">) => {
      const data = {
        ...interviewData,
        userId: user?.id
      };
      const res = await apiRequest("POST", "/api/interviews", data);
      return await res.json();
    },
    onSuccess: (data: Interview) => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      setLocation(`/interview/${data.id}`);
    },
  });

  const handleCreateInterview = (interviewData: Omit<InsertInterview, "userId">) => {
    createInterviewMutation.mutate(interviewData);
  };

  const handleResumeInterview = (interviewId: number) => {
    setLocation(`/interview/${interviewId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "technical": return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400";
      case "behavioral": return "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400";
      case "mixed": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header openModal={() => setModalOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Interviews</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track your interview practice sessions and progress
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !interviews || interviews.length === 0 ? (
              <div className="text-center py-16">
                <PlayCircle className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No interviews yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start your first practice interview to track your progress
                </p>
                <Button
                  onClick={() => setModalOpen(true)}
                  size="lg"
                  data-testid="button-start-first-interview"
                >
                  🚀 Start Your First Interview
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews?.map((interview: Interview) => (
                  <Card key={interview.id} className="hover:shadow-lg transition-shadow" data-testid={`card-interview-${interview.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-role-${interview.id}`}>
                            {interview.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(interview.createdAt), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          {interview.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" data-testid={`icon-completed-${interview.id}`} />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" data-testid={`icon-in-progress-${interview.id}`} />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Badge 
                            className={getDifficultyColor(interview.difficulty)}
                            data-testid={`badge-difficulty-${interview.id}`}
                          >
                            {interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)}
                          </Badge>
                          <Badge 
                            className={getTypeColor(interview.questionType)}
                            data-testid={`badge-type-${interview.id}`}
                          >
                            {interview.questionType.charAt(0).toUpperCase() + interview.questionType.slice(1)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-status-${interview.id}`}>
                            {interview.completed ? "Completed" : "In Progress"}
                          </span>
                          {interview.completed && interview.score !== null && (
                            <div className="flex items-center text-sm" data-testid={`text-score-${interview.id}`}>
                              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                              {interview.score}%
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleResumeInterview(interview.id)}
                          variant={interview.completed ? "outline" : "default"}
                          className="w-full mt-4"
                          data-testid={`button-${interview.completed ? 'review' : 'resume'}-${interview.id}`}
                        >
                          {interview.completed ? "Review Interview" : "Resume Interview"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <MobileNav />
      </div>
      
      <InterviewSetupModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateInterview}
        isLoading={createInterviewMutation.isPending}
      />
    </div>
  );
}