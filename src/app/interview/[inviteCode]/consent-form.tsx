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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, ChevronRight } from "lucide-react";

interface ConsentFormProps {
  seriesId: string;
  inviteCode: string;
  consentText: string;
  consentVersion: number;
}

export function ConsentForm({
  seriesId,
  inviteCode,
  consentText,
  consentVersion,
}: ConsentFormProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!agreed) {
      setError("Please read and agree to the consent form to continue.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/interview/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          consentVersion,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record consent");
      }

      const { sessionId } = await response.json();

      // Store session ID in localStorage for the interview
      localStorage.setItem("disco_session_id", sessionId);

      // Navigate to interview
      router.push(`/interview/${inviteCode}/session`);
    } catch (err) {
      console.error("Error recording consent:", err);
      setError(
        "Failed to start the interview. Please try again or contact support."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <CardTitle>Consent & Privacy</CardTitle>
        </div>
        <CardDescription>
          Please review and agree to participate in this research study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consent Text */}
        <div className="max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {consentText}
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Your Privacy:</strong> Your responses will be recorded and
            analyzed to identify insights. Personal information will be removed,
            and data will be stored securely for {/* Will be dynamic */}90 days.
          </AlertDescription>
        </Alert>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-3 rounded-lg border bg-white p-4">
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={(checked: boolean) => setAgreed(checked === true)}
          />
          <div className="flex-1">
            <Label
              htmlFor="consent"
              className="cursor-pointer text-sm font-medium leading-relaxed"
            >
              I have read and understood the consent form. I agree to
              participate in this research study and consent to the recording
              and analysis of my responses.
            </Label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!agreed || isSubmitting}
        >
          {isSubmitting ? (
            "Starting Interview..."
          ) : (
            <>
              Continue to Mic Check
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
