"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" className="flex-1" onClick={handleCopy}>
      <Copy className="mr-2 h-4 w-4" />
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
