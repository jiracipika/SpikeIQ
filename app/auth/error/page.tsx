import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandMark } from "@/components/common/brand-mark";

interface AuthErrorPageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { message } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex items-center justify-center">
          <Link href="/" aria-label="SpikeIQ home" className="focus-ring rounded-md">
            <BrandMark />
          </Link>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="items-center text-center">
            <span className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-6 w-6" aria-hidden />
            </span>
            <CardTitle className="text-xl">Authentication issue</CardTitle>
            <CardDescription>
              {message ?? "We could not complete that request. The link may be expired or invalid."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/sign-in" className="block">
              <Button className="w-full">Try signing in again</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                Return home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
