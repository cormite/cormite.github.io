# Release process

```
feature/* ──PR──▶ test ──auto──▶ STAGING (browser-testable)
                     │
                     └──PR (you approve)──▶ master ──manual workflow + approval──▶ PRODUCTION
```

| Environment | Branch | URL | Trigger |
|---|---|---|---|
| Staging | `test` | https://cormite.github.io/cormite-staging/ | automatic on every push to `test` |
| Production | `master` | https://www.cormite.com | **manual only** (`Deploy production` workflow) |

Production is never updated by a push. Two gates apply:
1. Run **Actions → Deploy production → Run workflow** on `master` and type `DEPLOY`.
2. A reviewer must approve the run (GitHub Environment `production` → required reviewers).

## Daily flow
1. Work on `test` (or a branch merged into it). Push.
2. CI runs (reproducible build check + Playwright smoke tests, desktop and mobile).
3. Staging redeploys. Review it in the browser.
4. Happy? Open a PR `test` → `master`, merge it (does **not** publish).
5. Run **Deploy production**, type `DEPLOY`, approve. Live in about a minute.

## Local
```bash
npm ci
npm run build          # tailwind + static pages (set SOURCE_DATE=<ISO date> for a reproducible build)
npm run serve          # http://localhost:4173
npm run test:local     # Playwright using installed Google Chrome
npm test               # Playwright with bundled Chromium (CI)
```

## One-time setup (cannot be done from code)
1. **Create repo** `cormite/cormite-staging` (public, empty, branch `main`). Settings → Pages → Deploy from branch `main` / root.
2. **Deploy key:** `ssh-keygen -t ed25519 -f staging_key -N ""`. Add `staging_key.pub` to the staging repo (Settings → Deploy keys, **allow write**). Add the private key as secret `STAGING_DEPLOY_KEY` in this repo, environment `staging`. Delete the local key files.
3. **Production Pages source:** this repo → Settings → Pages → Source = **GitHub Actions**. Keep custom domain `www.cormite.com` and Enforce HTTPS.
4. **Environments:** create `staging` (no rules) and `production` (Required reviewers = you; deployment branches = `master` only).
5. **Branch protection** on `master`: require PR, require status check `verify`, block force-push and deletion.
6. Optional: DNS `staging.cormite.com` CNAME → `cormite.github.io`, set as custom domain on the staging repo, then set `STAGING_BASE` to empty and drop the path rewrite.

> Switching Pages to "GitHub Actions" (step 3) means a push to `master` no longer publishes. Do it only after the first successful dry run on staging.

## Rollback
Re-run **Deploy production** after `git revert` on `master`, or run it on an earlier commit via a `hotfix/*` PR into `master`.
