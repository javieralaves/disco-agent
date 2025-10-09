"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Sparkles,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  goal: string;
  text: string;
}

interface QuestionsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuestionsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: QuestionsStepProps) {
  const [questions, setQuestions] = useState<Question[]>(data.questions || []);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(data.researchGoals[0] || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate questions on mount if none exist
  useEffect(() => {
    if (questions.length === 0 && data.researchGoals.length > 0) {
      generateQuestions();
    }
  }, []);

  const generateQuestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/series/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchFocus: data.researchFocus,
          researchGoals: data.researchGoals,
          context: data.context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const result = await response.json();
      setQuestions(result.questions);
    } catch (err) {
      setError(
        "Failed to generate questions. Please try again or add them manually."
      );
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    if (newQuestion.trim() && selectedGoal) {
      setQuestions([
        ...questions,
        { goal: selectedGoal, text: newQuestion.trim() },
      ]);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    console.log("🔍 QuestionsStep - handleNext called");
    console.log("  - Questions to save:", questions.length);

    // Update parent state with questions
    onUpdate({ questions });

    // Move to next step (pre-interview questions)
    onNext();
  };

  // Group questions by goal
  const questionsByGoal = data.researchGoals.reduce(
    (acc: any, goal: string) => {
      acc[goal] = questions.filter((q) => q.goal === goal);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isGenerating && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription className="ml-2">
            AI is generating interview questions for each research goal...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Questions by Goal */}
      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Interview Questions</h3>
              <p className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
                across {data.researchGoals.length} goal
                {data.researchGoals.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate All
                </>
              )}
            </Button>
          </div>

          {data.researchGoals.map((goal: string, goalIndex: number) => (
            <div key={goalIndex} className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge className="mt-1">Goal {goalIndex + 1}</Badge>
                <h4 className="flex-1 text-sm font-medium">{goal}</h4>
              </div>

              <div className="ml-6 space-y-2">
                {questionsByGoal[goal]?.length > 0 ? (
                  questionsByGoal[goal].map(
                    (question: Question, qIndex: number) => {
                      const overallIndex = questions.findIndex(
                        (q) => q === question
                      );
                      return (
                        <div
                          key={qIndex}
                          className="flex items-start gap-3 rounded-lg border bg-white p-3"
                        >
                          <GripVertical className="mt-0.5 h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm">{question.text}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeQuestion(overallIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    }
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No questions yet for this goal
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Question */}
      <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium">Add Custom Question</h3>
        <div className="space-y-2">
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
          >
            {data.researchGoals.map((goal: string, index: number) => (
              <option key={index} value={goal}>
                Goal {index + 1}: {goal.substring(0, 50)}
                {goal.length > 50 ? "..." : ""}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Can you walk me through your last experience with...?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addQuestion()}
            />
            <Button onClick={addQuestion} disabled={!newQuestion.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Great interview questions are open-ended and
          encourage storytelling. Start with "Tell me about..." or "Walk me
          through..." rather than yes/no questions.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={questions.length === 0}
          size="lg"
        >
          Continue to Pre-Interview Questions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
