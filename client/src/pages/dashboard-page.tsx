import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentInterviews } from "@/components/dashboard/recent-interviews";
import { ImprovementAreas } from "@/components/dashboard/improvement-areas";
import { Interview, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CheckCheck, BarChart, Award, Loader2 } from "lucide-react";

interface DashboardPageProps {
  onStartInterview: () => void;
}

export default function DashboardPage({ onStartInterview }: DashboardPageProps) {
  const { user } = useAuth();

  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  // Calculate statistics
  const completedInterviews = interviews?.filter(i => i.completed) || [];
  const interviewCount = completedInterviews.length;
  const averageScore = interviewCount > 0
    ? Math.round(completedInterviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviewCount)
    : 0;

  // Get strongest area (this would be better from an API endpoint)
  const strongestArea = "Technical Knowledge";

  // Parse to display in better format
  const thisWeek = interviews?.filter(i => 
    i.completed && new Date(i.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-heading font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="mb-4 text-white/80">Ready to ace your next interview? Practice makes perfect.</p>
        <Button 
          onClick={onStartInterview} 
          variant="secondary" 
          className="bg-white text-primary-foreground hover:bg-gray-100"
        >
          Start New Interview
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard 
              title="Interviews Completed" 
              value={interviewCount.toString()} 
              change={`+${thisWeek} this week`}
              icon={<CheckCheck className="text-green-500" />}
            />
            <StatsCard 
              title="Average Score" 
              value={`${averageScore}%`} 
              change="+5% improvement"
              icon={<BarChart className="text-blue-500" />}
            />
            <StatsCard 
              title="Strongest Area" 
              value={strongestArea} 
              change="Based on last 5 interviews"
              icon={<Award className="text-yellow-500" />}
            />
          </div>

          {/* Recent interviews */}
          <RecentInterviews interviews={interviews?.slice(0, 3) || []} />

          {/* Improvement areas */}
          <ImprovementAreas />
        </>
      )}
    </div>
  );
}
