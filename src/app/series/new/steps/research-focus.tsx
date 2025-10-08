"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lightbulb } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  researchFocus: z
    .string()
    .min(10, "Research focus must be at least 10 characters"),
  context: z.object({
    company: z.string().optional(),
    product: z.string().optional(),
    assumptions: z.string().optional(),
    hypotheses: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ResearchFocusStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function ResearchFocusStep({
  data,
  onUpdate,
  onNext,
}: ResearchFocusStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data.title || "",
      researchFocus: data.researchFocus || "",
      context: data.context || {
        company: "",
        product: "",
        assumptions: "",
        hypotheses: "",
      },
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    onUpdate(values);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 300));

    setIsLoading(false);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Series Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Q4 Onboarding Research" {...field} />
              </FormControl>
              <FormDescription>
                A memorable name for this research series
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Research Focus */}
        <FormField
          control={form.control}
          name="researchFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Research Focus *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Why do users churn in the first week after signing up?"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                What do you want to learn? Be specific about the problem or
                opportunity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Context Section */}
        <div className="space-y-4 rounded-lg border bg-blue-50/50 p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                Add Context (Optional)
              </h3>
              <p className="text-sm text-blue-700">
                Help AI generate better research goals by providing context
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="context.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company/Product Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Disco - Research interview platform"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context.product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product/Feature Context</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Our onboarding flow has 5 steps and takes users through profile setup, team invites, and first project creation..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context.assumptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Assumptions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., We assume users churn because the onboarding is too long..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="context.hypotheses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hypotheses/Open Questions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Do users understand the value proposition? Are they getting stuck on a specific step?"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue to Research Goals"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
