import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <MessageSquare className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Chat Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            We're working on an AI-powered chat feature that will let you
            explore your research insights through natural conversation.
          </p>
          <p className="mt-4 text-sm text-gray-500">Stay tuned for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}
