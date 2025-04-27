import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnswerFormProps {
  answer: string;
  setAnswer: (answer: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AnswerForm({ answer, setAnswer, onSubmit, isSubmitting }: AnswerFormProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const { toast } = useToast();
  
  // Check if speech recognition is supported
  useEffect(() => {
    const isBrowserSpeechRecognitionSupported = 
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window;
    
    setSpeechSupported(isBrowserSpeechRecognitionSupported);
    
    if (!isBrowserSpeechRecognitionSupported) {
      console.log("Speech recognition not supported by this browser");
    }
  }, []);
  
  const toggleListening = () => {
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome, Edge or Safari.",
        variant: "destructive"
      });
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    setIsListening(true);
    
    // Use the browser's SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      toast({
        title: "Listening",
        description: "Speak now. Click the microphone again to stop."
      });
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setAnswer(transcript);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      
      // Handle common errors with more user-friendly messages
      let errorMessage = "Speech recognition failed. Please try again.";
      
      if (event.error === 'no-speech') {
        errorMessage = "No speech detected. Please speak louder or check your microphone settings.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "No microphone detected. Please connect a microphone and try again.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (event.error === 'network') {
        errorMessage = "Network error occurred. Please check your internet connection.";
      }
      
      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    // Start listening
    recognition.start();
    
    // Store the recognition instance to be able to stop it later
    window.recognitionInstance = recognition;
  };
  
  const stopListening = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop();
      toast({
        title: "Voice Input Stopped",
        description: "Your speech has been converted to text."
      });
    }
    setIsListening(false);
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <Label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Answer:
        </Label>
        <Textarea 
          id="answer" 
          rows={6} 
          placeholder="Type your answer here or use voice input..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="resize-none mb-4"
        />
        
        <div className="flex justify-between items-center">
          <Button 
            variant={isListening ? "default" : "outline"} 
            size="sm"
            onClick={toggleListening}
            disabled={isSubmitting}
            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Voice Input
              </>
            )}
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

// Add TypeScript declaration for Speech Recognition
declare global {
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    grammars: any;
    onstart: (event: Event) => void;
    onend: (event: Event) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    recognitionInstance: SpeechRecognition | null;
  }
}
