import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    // Basic validation for Gemini API key (they don't have a consistent format)
    if (apiKey.length < 10) {
      toast({
        title: "Invalid API Key",
        description: "The API key appears too short",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/update-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to update API key");
      }

      setSuccess(true);
      setApiKey("");
      toast({
        title: "API Key Updated",
        description: "Your Gemini API key has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              API Configuration
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To enable AI-generated interview questions and feedback, you need to provide a Google Gemini AI API key.
              You can get a key from the <a href="https://ai.google.dev/tutorials/setup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
            </p>
            
            <form onSubmit={handleUpdateApiKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Gemini API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your API key is stored securely and never shared.
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={success ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : success ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Updated
                  </>
                ) : (
                  "Update API Key"
                )}
              </Button>
            </form>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user?.username || ""}
                  readOnly
                  className="w-full bg-gray-50 dark:bg-gray-700"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={user?.firstName || ""}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-gray-700"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={user?.lastName || ""}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}