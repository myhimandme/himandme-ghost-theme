# Stage 1 verification suite

Checks routing, canonical URLs, content-block (`#blok`) discoverability and theme settings against a **local** Ghost 6.75.0. Every script refuses to run against any host other than `localhost` / `127.0.0.1`.

## Local Ghost 6.75.0 (one-time)

Ghost-CLI will not run as root, so use a normal user account.

```bash
npm install -g ghost-cli@1.34.1 pnpm@latest   # Ghost 6.75.0 needs pnpm 11.10+ to install
mkdir ~/ghost-local && cd ~/ghost-local
ghost install 6.75.0 --local                  # SQLite, http://localhost:2368
```

Then open http://localhost:2368/ghost/ and create a local owner account. Never reuse production credentials.

## Run

```bash
npm run zip                          # builds dist/himandme-ghost-theme.zip
node test/stage1/make-fixtures.mjs   # writes fixtures/seed-stage1.json (test data only)
export GHOST_ADMIN_EMAIL=… GHOST_ADMIN_PASSWORD=…   # local dev owner
node test/stage1/reset-local.mjs     # wipes LOCAL content, uploads theme + routes, imports fixtures
npm run test:stage1                  # runs the checks; results in test/stage1/.local/results.json
```

`reset-local.mjs` uses the Admin API. The same three steps were also carried out by hand through the Admin UI (theme upload, Routes editor, Universal import); see `docs/admin-paths/`.

For check B8, turn **Settings → Growth → Network** off. On localhost the switch is greyed out ("configure a supported custom domain"), but the stored setting defaults to on. Locally it was set to off through the Admin API (`social_web: false`).
