# MAO Backend (Convex)

Lead capture for the free workshop. The static page POSTs to a Convex HTTP
endpoint which writes to a `workshopLeads` table.

## One-time setup

```bash
cd backend
npm install
npx convex dev
```

`convex dev` will:
1. Open a browser tab — log in with Google.
2. Create a new Convex project (call it `mao` or similar).
3. Write `.env.local` with `CONVEX_DEPLOYMENT` + `CONVEX_URL`.
4. Push the schema + functions + HTTP routes.
5. Print the **HTTP Actions URL** — looks like `https://<deployment>.convex.site`.

Copy that HTTP Actions URL and paste it into `../workshop.js` at `CONVEX_URL`.

Leave `npx convex dev` running while editing functions (it auto-syncs). Stop it
when done — production stays deployed.

## Production deploy

```bash
npx convex deploy
```

Pushes the current `convex/` folder to prod. URL stays the same.

## Inspect leads

- Dashboard: https://dashboard.convex.dev → your project → Data → `workshopLeads`
- Or query from CLI: `npx convex run leads:list`

## Schema

| Field      | Type   | Notes                              |
|------------|--------|------------------------------------|
| email      | string | Lowercased on write, indexed       |
| phone      | string | Free-form, kept as submitted       |
| source     | string | "free_workshop" from the workshop page |
| createdAt  | number | epoch ms                           |

Duplicate emails update phone + source on the existing row instead of inserting.
