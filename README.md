# dazgveva.github.io

dazgveva.ge V3 demo: a static Next.js app (Tailwind CSS v4, Heroicons + a few themed Lucide
icons). Everything is simulated in the browser; there is no backend.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build for GitHub Pages

```bash
npm run build      # next build (static export) → out/ → copied to docs/ (+ .nojekyll)
```

GitHub Pages serves the `docs/` folder (Settings → Pages → Branch `main`, folder `/docs`).
Commit `docs/` after every build.

## Structure

- `app/`: one folder per screen (client flow, `partner/` insurer portal, `admin/`, `login/`, `password/`)
- `components/`: header, footer, scenario navigator, modals, toasts, portal layouts, shared bits
- `lib/demo.ts`: all demo data and logic (auction, valuation, requests, admin); `lib/useDemo.ts` connects it to React
- `public/logo.svg`: the logo

Staff sign in at `/login/` (not linked from the public site). The demo navigator („სცენარები“)
jumps to every scenario, including the admin and insurer portals.
