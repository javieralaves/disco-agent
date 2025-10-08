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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResearchGoalsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ResearchGoalsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ResearchGoalsStepProps) {
  const [goals, setGoals] = useState<string[]>(data.researchGoals || []);
  const [newGoal, setNewGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate goals on mount if none exist
  useEffect(() => {
    if (goals.length === 0 && data.researchFocus) {
      generateGoals();
    }
  }, []);

  const generateGoals = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/series/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchFocus: data.researchFocus,
          context: data.context,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate goals");
      }

      const result = await response.json();
      setGoals(result.goals);
    } catch (err) {
      setError(
        "Failed to generate research goals. Please try again or add them manually."
      );
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onUpdate({ researchGoals: goals });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isGenerating && (
        <Alert>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <AlertDescription className="ml-2">
            AI is generating research goals from your focus...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Research Goals</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated objectives based on your research focus
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateGoals}
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

          <div className="space-y-2">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border bg-white p-4"
              >
                <Badge variant="secondary" className="mt-0.5">
                  {index + 1}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{goal}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeGoal(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Goal */}
      <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium">Add Custom Goal</h3>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Understand user motivations for signing up"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addGoal()}
          />
          <Button onClick={addGoal} disabled={!newGoal.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Good research goals are specific and
          actionable. They should help you understand user behavior,
          motivations, or pain points.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={goals.length === 0}
          size="lg"
        >
          Continue to Questions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
