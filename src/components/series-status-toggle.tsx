"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeriesStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface SeriesStatusToggleProps {
  seriesId: string;
  currentStatus: SeriesStatus;
}

export function SeriesStatusToggle({
  seriesId,
  currentStatus,
}: SeriesStatusToggleProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: SeriesStatus) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/series/${seriesId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating series status:", error);
      alert("Failed to update series status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusChange(value as SeriesStatus)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SeriesStatus.DRAFT}>Draft</SelectItem>
          <SelectItem value={SeriesStatus.ACTIVE}>Active</SelectItem>
          <SelectItem value={SeriesStatus.PAUSED}>Paused</SelectItem>
          <SelectItem value={SeriesStatus.COMPLETED}>Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
