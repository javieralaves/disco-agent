import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, MessageSquare, TrendingUp, Zap } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="text-2xl">🎵</span>
              <span className="font-bold">Disco</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
            Your research partner that interviews, synthesizes, and cites
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Ship the right things faster. Conduct voice or text interviews at
            scale, get instant summaries, and discover themes with
            evidence-backed citations.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24 md:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
            Features
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Everything you need to run continuous discovery research
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Mic className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold">Smart Interviews</h3>
            <p className="text-sm text-muted-foreground">
              Voice or text interviews with real-time transcription and PII
              redaction
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold">Auto-Summarization</h3>
            <p className="text-sm text-muted-foreground">
              Get structured summaries highlighting problems, goals, friction,
              and opportunities
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold">Theme Synthesis</h3>
            <p className="text-sm text-muted-foreground">
              Discover patterns across sessions with confidence scoring and
              evidence linking
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-bold">Cited Answers</h3>
            <p className="text-sm text-muted-foreground">
              Query insights with jump-to citations linking to exact session
              moments
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gray-50">
        <div className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32">
          <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl">
              Ready to ship the right things?
            </h2>
            <p className="max-w-[750px] text-lg text-muted-foreground">
              Start conducting research interviews today. No credit card
              required.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/auth/signin">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose md:text-left">
              Built with Next.js, OpenAI, and Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
