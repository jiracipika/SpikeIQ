import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Placeholder auth screen. This keeps the flow ready while backend auth is not connected yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@domain.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Input id="password" type="password" placeholder="********" />
          </div>
          <Link href="/connect-riot" className="block">
            <Button className="w-full">Continue</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            TODO(auth): Replace with Supabase Auth session, providers, and server actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
