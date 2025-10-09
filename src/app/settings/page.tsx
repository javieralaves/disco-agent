import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Settings className="h-8 w-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl">Settings Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            We're building a comprehensive settings page where you can manage
            your account, preferences, and integrations.
          </p>
          <p className="mt-4 text-sm text-gray-500">Stay tuned for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}
