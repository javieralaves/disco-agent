"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ResearchFocusStep } from "./steps/research-focus";
import { ResearchGoalsStep } from "./steps/research-goals";
import { QuestionsStep } from "./steps/questions";
import { PreInterviewQuestionsStep } from "./steps/pre-interview-questions";

const STEPS = [
  {
    id: 1,
    title: "Research Focus",
    description: "Define what you want to learn",
  },
  { id: 2, title: "Research Goals", description: "AI-generated objectives" },
  { id: 3, title: "Questions", description: "Interview questions per goal" },
  {
    id: 4,
    title: "Pre-Interview Questions",
    description: "Gather participant context",
  },
];

export default function NewSeriesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [seriesData, setSeriesData] = useState<any>({
    title: "",
    researchFocus: "",
    context: {
      company: "",
      product: "",
      assumptions: "",
      hypotheses: "",
    },
    researchGoals: [],
    questions: [],
    preInterviewQuestions: [],
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateData = (data: Partial<typeof seriesData>) => {
    setSeriesData({ ...seriesData, ...data });
  };

  const handleComplete = async (finalPreInterviewQuestions?: any[]) => {
    try {
      // Use the provided pre-interview questions or fall back to seriesData
      const dataToSend = {
        ...seriesData,
        preInterviewQuestions:
          finalPreInterviewQuestions !== undefined
            ? finalPreInterviewQuestions
            : seriesData.preInterviewQuestions,
      };

      console.log("🚀 Wizard - handleComplete called");
      console.log("  - Final data questions:", dataToSend.questions?.length);
      console.log(
        "  - Pre-interview questions:",
        dataToSend.preInterviewQuestions?.length
      );

      const response = await fetch("/api/series/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Failed to create series");
      }

      const { series } = await response.json();
      router.push(`/series/${series.id}`);
    } catch (error) {
      console.error("Error creating series:", error);
      alert("Failed to create series. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Create Interview Series</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}:{" "}
                {STEPS[currentStep - 1].title}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-white">
        <div className="container py-6">
          <Progress value={progress} className="h-2" />
          <div className="mt-4 flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id === currentStep
                    ? "text-blue-600"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step.id === currentStep
                      ? "border-blue-600 bg-blue-50"
                      : step.id < currentStep
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <span className="mt-2 text-xs font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container flex-1 py-8">
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <ResearchFocusStep
                data={seriesData}
                onUpdate={handleUpdateData}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <ResearchGoalsStep
                data={seriesData}
                onUpdate={handleUpdateData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <QuestionsStep
                data={seriesData}
                onUpdate={handleUpdateData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <PreInterviewQuestionsStep
                data={seriesData}
                onUpdate={handleUpdateData}
                onComplete={handleComplete}
                onBack={handleBack}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
