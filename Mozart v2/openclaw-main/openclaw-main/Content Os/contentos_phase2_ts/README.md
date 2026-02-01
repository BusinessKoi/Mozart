# ContentOS Phase 2 (TypeScript)

Implements **Phase 2** only:
- **Intent Engine**: Calendar → Deal → Shoot Brief
- **CTR Gate**: Title/Thumbnail/Hook promise alignment gate

No distribution, no analytics, no packaging engines.

## Requirements
- Node.js 20+

## Setup
```bash
npm i
cp config.example.yaml config.yaml
cp .env.example .env
```

### Provide inputs
1) **Calendar** (choose one):
- ICS mode (default): put an `calendar.ics` file in repo root **or** update `calendar.ics_path` in `config.yaml`.
- Google mock mode: set `calendar.mode: "google"` and ensure `config.yaml -> calendar.google.mock: true`, then create `mock_calendar_events.json`.

2) **Deals**
Create `deals.json` in repo root (or set `paths.deals_path`). Format:
```json
{
  "DEAL_123": {
    "address": "123 Oak St",
    "price": 485000,
    "terms": "0% interest for 24 months",
    "promise": "0% interest; 24 months"
  }
}
```

3) **Event description structured fields**
Include key/value lines in the calendar event description (preferred):
```
[ON-SITE]
deal_id: DEAL_123
address: 123 Oak St
price: 485000
terms: 0% interest for 24 months
promise: 0% interest; 24 months
notes: film seller financing proof
```

## Build
```bash
npm run build
```

## CLI
All CLI outputs are JSON.

### 1) Ingest calendar
```bash
node dist/cli.js ingest-calendar --date 2026-01-31
```

### 2) Generate brief
```bash
node dist/cli.js generate-brief --date 2026-01-31 --event-id <EVENT_ID>
```
Writes:
```
outputs/YYYY-MM-DD/event_id/
  shoot_brief.json
  shoot_brief.md
  capture_checklist.txt
```

### 3) CTR gate
```bash
node dist/cli.js ctr-gate --brief outputs/YYYY-MM-DD/event_id/shoot_brief.json
```
Writes:
```
outputs/YYYY-MM-DD/event_id/ctr_gate_report.json
```

### 4) End-to-end
```bash
node dist/cli.js run --date 2026-01-31
```

## Tests
```bash
npm test
```

Tests run with **no external services**.

## Troubleshooting
- **No events found**: confirm the ICS has events on the exact `YYYY-MM-DD` date and includes tags like `[ON-SITE]`.
- **Missing deal_id**: add `deal_id: ...` to the event description or ensure `deals.json` has the deal.
- **CTR gate failing**: use the `ctr_gate_report.json` fixes (titles/overlays/hook) and regenerate.
