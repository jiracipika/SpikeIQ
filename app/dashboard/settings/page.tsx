import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Link2,
  LogOut,
  Mail,
  RefreshCcw,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { getValorantService } from "@/lib/services";
import { getConnectedRiotAccount } from "@/lib/riot/store";

export default async function SettingsPage() {
  const service = await getValorantService();
  const [{ user, settings }, riotAccount] = await Promise.all([
    service.getSettingsPageData(),
    getConnectedRiotAccount(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Profile & settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account, analytics preferences, and connected services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>
            Your public identity on SpikeIQ. Your Riot ID is only visible to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field id="displayName" label="Display name" defaultValue={user.displayName} />
          <Field id="tagline" label="Riot tagline" defaultValue={user.tagline} monospace />
          <Field id="region" label="Region" defaultValue={user.region} />
          <Field id="email" label="Email" defaultValue={user.email} type="email" />
          <Field id="role" label="Preferred role" defaultValue={settings.preferredRole} />
          <Field id="agents" label="Preferred agents" defaultValue={settings.preferredAgents.join(", ")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riot account</CardTitle>
          <CardDescription>Sync match data from your linked Riot account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={
                "flex h-10 w-10 items-center justify-center rounded-md " +
                (riotAccount
                  ? "bg-success/15 text-success"
                  : "bg-primary/10 text-primary")
              }
            >
              <Link2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              {riotAccount ? (
                <>
                  <p className="text-sm font-medium text-foreground">
                    {riotAccount.gameName}
                    <span className="ml-1 font-mono text-muted-foreground">
                      #{riotAccount.tagLine}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Region {riotAccount.region} · Connected{" "}
                    {new Date(riotAccount.createdAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Not connected</p>
                  <p className="text-xs text-muted-foreground">
                    Link your Riot account to auto-import match history.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {riotAccount ? (
              <>
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden /> Linked
                </Badge>
                <Button variant="outline" size="sm" disabled>
                  <RefreshCcw className="h-4 w-4" /> Sync now
                </Button>
                <form action="/api/riot/disconnect" method="post">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:text-danger"
                  >
                    Disconnect
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/connect-riot">
                <Button size="sm">
                  <Link2 className="h-4 w-4" /> Connect Riot account
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what SpikeIQ sends you by email.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            icon={Mail}
            title="Product updates"
            description="New analytics features, coaching modules, and release notes."
            defaultChecked={settings.emailUpdates}
            id="email-updates"
          />
          <ToggleRow
            icon={Bell}
            title="Weekly recap"
            description="Every Monday: your best map, most improved agent, and biggest leak."
            defaultChecked={settings.weeklyRecap ?? true}
            id="weekly-recap"
          />
          <ToggleRow
            icon={RefreshCcw}
            title="Auto-sync matches"
            description="Import new matches within minutes of completion."
            defaultChecked={settings.autoSync ?? true}
            id="auto-sync"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Control who can see your profile and stats.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            {(["private", "friends", "public"] as const).map((value) => (
              <label
                key={value}
                className={
                  "focus-ring flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors " +
                  (settings.profileVisibility === value
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground")
                }
              >
                <span className="capitalize">{value}</span>
                <Shield className="h-3.5 w-3.5" aria-hidden />
                <input
                  className="sr-only"
                  type="radio"
                  name="visibility"
                  value={value}
                  defaultChecked={settings.profileVisibility === value}
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-base text-danger">Danger zone</CardTitle>
          <CardDescription>
            These actions are permanent. Export your data first if you plan to return later.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <form action="/auth/logout" method="post">
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </form>
          <Button variant="outline" className="border-danger/40 text-danger hover:bg-danger/10">
            <Trash2 className="h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  defaultValue,
  type = "text",
  monospace,
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: string;
  monospace?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className={monospace ? "font-mono" : undefined}
      />
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  defaultChecked,
  id,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  defaultChecked: boolean;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {title}
          </label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} aria-label={title} />
    </div>
  );
}
