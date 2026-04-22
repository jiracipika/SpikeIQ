import Link from "next/link";
import { CheckCircle2, Link2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConnectRiotPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect Riot Account</CardTitle>
          <CardDescription>
            Placeholder account-linking screen. This flow is intentionally UI-first until secure Riot linking is added.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            TODO(riot-link): Replace this block with OAuth/device-link flow and backend token exchange.
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Riot account identity verification
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Region and in-game profile sync
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Match import scheduling
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Link2 className="h-4 w-4" />
              Start Riot linking (placeholder)
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Skip and open dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
