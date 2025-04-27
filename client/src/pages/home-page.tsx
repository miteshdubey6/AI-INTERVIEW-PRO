import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import DashboardPage from "@/pages/dashboard-page";
import { InterviewSetupModal } from "@/components/interview/interview-setup-modal";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertInterview, Interview } from "@shared/schema";
import { useLocation } from "wouter";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header openModal={() => setModalOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <DashboardPage onStartInterview={() => setModalOpen(true)} />
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
