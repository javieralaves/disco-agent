import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function InterviewCompletePage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg text-gray-700">
            Your interview has been completed and your responses have been
            recorded.
          </p>

          <div className="rounded-lg bg-indigo-50 p-4">
            <div className="flex items-center justify-center gap-2 text-indigo-700">
              <Sparkles className="h-5 w-5" />
              <p className="font-medium">
                Your insights will help improve products and services
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Your responses will be analyzed to identify patterns and insights.
              All personal information will be kept confidential.
            </p>
            <p>
              If you have any questions about this research study, please
              contact the research team.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              You can now safely close this window.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
