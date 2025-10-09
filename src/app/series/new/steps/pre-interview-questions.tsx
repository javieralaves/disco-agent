"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface PreInterviewQuestion {
  id: string;
  question: string;
  placeholder: string;
}

interface PreInterviewQuestionsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: (questions?: PreInterviewQuestion[]) => void;
  onBack: () => void;
}

export function PreInterviewQuestionsStep({
  data,
  onUpdate,
  onComplete,
  onBack,
}: PreInterviewQuestionsStepProps) {
  const [questions, setQuestions] = useState<PreInterviewQuestion[]>(
    data.preInterviewQuestions || []
  );
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    placeholder: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasGeneratedRef = useRef(false);

  // Auto-generate questions on mount if none exist and haven't generated yet
  useEffect(() => {
    if (
      questions.length === 0 &&
      data.researchFocus &&
      !hasGeneratedRef.current
    ) {
      hasGeneratedRef.current = true;
      generateQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQuestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/series/generate-pre-interview-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            researchFocus: data.researchFocus,
            context: data.context,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const result = await response.json();
      setQuestions(result.questions || []);
    } catch (err) {
      setError(
        "Failed to generate pre-interview questions. Please try again or add them manually."
      );
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    if (newQuestion.question.trim()) {
      const newId = `q${questions.length + 1}`;
      setQuestions([
        ...questions,
        {
          id: newId,
          question: newQuestion.question.trim(),
          placeholder: newQuestion.placeholder.trim() || "Your answer here...",
        },
      ]);
      setNewQuestion({ question: "", placeholder: "" });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    onUpdate({ preInterviewQuestions: questions });
    onComplete(questions);
  };

  const handleSkip = () => {
    onUpdate({ preInterviewQuestions: [] });
    onComplete([]);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm text-indigo-900">
          <strong>💡 What are pre-interview questions?</strong>
          <br />
          These optional questions appear before the interview starts, helping
          you understand who you're talking to. Participants can choose to
          answer or skip them.
        </p>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription className="ml-2">
            AI is generating pre-interview questions...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Questions */}
      {(questions.length > 0 || isGenerating) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Pre-Interview Questions</h3>
              <p className="text-sm text-muted-foreground">
                This helps tailor the interview to you.
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
                  Regenerate
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="flex items-start gap-3 rounded-lg border bg-white p-4"
              >
                <Badge variant="secondary" className="mt-0.5">
                  {index + 1}
                </Badge>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground">
                    Placeholder: {q.placeholder}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeQuestion(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Question */}
      <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium">Add Custom Question</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="new-question">Question</Label>
            <Textarea
              id="new-question"
              placeholder="e.g., What is your current role or occupation?"
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="new-placeholder">Placeholder Text</Label>
            <Input
              id="new-placeholder"
              placeholder="e.g., Product Manager, Student, etc."
              value={newQuestion.placeholder}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, placeholder: e.target.value })
              }
            />
          </div>
          <Button
            onClick={addQuestion}
            disabled={!newQuestion.question.trim()}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Best Practices:</strong> Keep questions open-ended and
          non-discriminatory. Focus on understanding relevant experience or
          context that helps tailor the interview. Participants can skip any
          question.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip This Step
          </Button>
          <Button onClick={handleComplete} size="lg">
            Create Series
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
