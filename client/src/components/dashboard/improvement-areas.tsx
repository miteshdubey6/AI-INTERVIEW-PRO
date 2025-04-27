import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Code, Timer } from "lucide-react";

export function ImprovementAreas() {
  const areas = [
    {
      title: "Communication Clarity",
      description: "Practice explaining complex concepts in simpler terms. Try the STAR method for behavioral questions.",
      icon: <Target className="text-xl text-amber-500" />
    },
    {
      title: "Algorithm Knowledge",
      description: "Review sorting algorithms and practice more complex data structure problems.",
      icon: <Code className="text-xl text-blue-500" />
    },
    {
      title: "Time Management",
      description: "Work on pacing your answers to ensure you cover all necessary points without rushing.",
      icon: <Timer className="text-xl text-green-500" />
    }
  ];

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle>Suggested Improvement Areas</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <ul className="space-y-4">
          {areas.map((area, index) => (
            <li key={index} className="flex">
              <div className="mr-3 mt-0.5">
                {area.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{area.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{area.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
