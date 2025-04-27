import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mic, Loader2 } from "lucide-react";

interface AnswerFormProps {
  answer: string;
  setAnswer: (answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AnswerForm({ answer, setAnswer, onSubmit, isSubmitting }: AnswerFormProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Answer:
        </Label>
        <Textarea 
          id="answer" 
          rows={6} 
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="resize-none mb-4"
        />
        
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" disabled>
            <Mic className="h-4 w-4 mr-2" />
            Voice Input
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit Answer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
