"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GenerateThemesButtonProps {
  seriesId: string;
  sessionCount: number;
}

export function GenerateThemesButton({
  seriesId,
  sessionCount,
}: GenerateThemesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/series/generate-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate themes");
      }

      const data = await response.json();

      // Navigate to themes page to show results
      router.push("/dashboard/themes");
      router.refresh();
    } catch (err) {
      console.error("Error generating themes:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate themes"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionCount === 0) {
    return (
      <Button disabled variant="outline" className="w-full gap-2">
        <TrendingUp className="h-4 w-4" />
        Generate Themes
        <span className="ml-auto text-xs">(No sessions yet)</span>
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full gap-2"
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing {sessionCount} sessions...
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" />
            Generate Themes
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
