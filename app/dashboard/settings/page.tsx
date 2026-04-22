import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { valorantService } from "@/lib/services";

export default async function SettingsPage() {
  const { user, settings } = await valorantService.getSettingsPageData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Profile & Settings</h2>
        <p className="text-sm text-muted-foreground">Manage account profile, analytics preferences, and visibility.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Placeholder settings form backed by mock data.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm text-muted-foreground">
              Display Name
            </label>
            <Input id="displayName" defaultValue={user.displayName} />
          </div>
          <div className="space-y-2">
            <label htmlFor="region" className="text-sm text-muted-foreground">
              Region
            </label>
            <Input id="region" defaultValue={user.region} />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm text-muted-foreground">
              Preferred Role
            </label>
            <Input id="role" defaultValue={settings.preferredRole} />
          </div>
          <div className="space-y-2">
            <label htmlFor="agents" className="text-sm text-muted-foreground">
              Preferred Agents
            </label>
            <Input id="agents" defaultValue={settings.preferredAgents.join(", ")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Save changes (placeholder)</Button>
          <Button variant="outline">Disconnect Riot (placeholder)</Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        TODO(settings): connect this form to server actions + Supabase profile table updates.
      </p>
    </div>
  );
}
