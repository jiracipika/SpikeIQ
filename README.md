# SpikeIQ

Leetify for VALORANT — analytics app built with mock data first and a service-layer architecture designed for future Supabase + Riot integration.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-friendly component structure
- Recharts (trend chart)

## Run locally

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

## Architecture highlights

- `lib/services/contracts.ts` defines the data interface pages depend on.
- `lib/services/mock-valorant-repository.ts` supplies mock data today.
- `lib/services/valorant-service.ts` composes page-ready data with stable method signatures.
- Pages consume `valorantService` only, never mock files directly.

## Future integration

- Schema proposal: `docs/supabase-schema-proposal.md`
- `.env.example` includes TODOs for Supabase and Riot keys.
