# Client portal (clients.plumblinestudio.dev)

The static client portal, deployed to the Vercel project `plumbline-clients`. It reads and
writes through Supabase (plumbline-platform) with the publishable key and RLS-checked RPCs
(see `portal.js`); no client data lives in these files.

- `index.html`: sign in (magic link) and "your projects"
- `p.html`: a project page. The studio bar at the top is Plumbline's; everything under
  `.wrap` wears the client's own brand, loaded from their workup data.
- `board.html`: an operating map (client-branded under the studio bar)
- `vercel.json`: clean URLs and the `/p/:code` rewrites

Until 2026-11-15 this source lived only in the Vercel deployment. The first commit here is
the live deployment as served; later commits change it.

## Deploying

From this folder: `vercel deploy --prod` (project `plumbline-clients`, team `plumblinestudio`).
Kyle deploys; agents open PRs.
