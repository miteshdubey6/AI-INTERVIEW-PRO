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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, Target, Award } from "lucide-react";

export default function ProgressPage() {
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

  const completedInterviews = interviews?.filter((interview: Interview) => interview.completed) || [];
  const totalInterviews = interviews?.length || 0;
  const averageScore = completedInterviews.length > 0 
    ? Math.round(completedInterviews.reduce((sum: number, interview: Interview) => sum + (interview.score || 0), 0) / completedInterviews.length)
    : 0;

  const difficultyStats = interviews?.reduce((acc: Record<string, number>, interview: Interview) => {
    acc[interview.difficulty] = (acc[interview.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header openModal={() => setModalOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track your interview performance and improvement over time
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card data-testid="card-total-interviews">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-total-interviews">{totalInterviews}</div>
                      <p className="text-xs text-muted-foreground">
                        Practice sessions completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-completed-interviews">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-completed-interviews">{completedInterviews.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Finished interviews
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-average-score">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-average-score">{averageScore}%</div>
                      <p className="text-xs text-muted-foreground">
                        {completedInterviews.length > 0 ? "Overall performance" : "No completed interviews"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-in-progress">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-in-progress">{totalInterviews - completedInterviews.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Active sessions
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card data-testid="card-difficulty-breakdown">
                  <CardHeader>
                    <CardTitle>Difficulty Breakdown</CardTitle>
                    <CardDescription>
                      Number of interviews attempted by difficulty level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(difficultyStats).map(([difficulty, count]: [string, number]) => (
                        <div key={difficulty} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              difficulty === 'easy' ? 'bg-green-500' :
                              difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm font-medium capitalize" data-testid={`text-${difficulty}-label`}>
                              {difficulty}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground" data-testid={`text-${difficulty}-count`}>
                            {count} interviews
                          </span>
                        </div>
                      ))}
                      {Object.keys(difficultyStats).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No interview data available yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
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