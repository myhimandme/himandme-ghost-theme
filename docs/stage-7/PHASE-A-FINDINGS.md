# Stage 7, Phase A findings (read-only audit)

> **Status: Phase A, first pass (17 Nov 2026). Waiting for the owner's server and Admin results.** Phase B is **not** started and needs separate written approval.
>
> **What was done:** read-only checks only.
> - Anonymous HTTPS **GET** requests to `https://himandme.my` from this session. Access was enabled for this purpose through a new personal environment, "Him & Me website", that allows only himandme.my and www.himandme.my.
> - Tests on the **local** Ghost 6.75.0.
>
> **Nothing was changed on production:** no login, no Admin, no SSH, no DNS or Cloudflare change, no backup, no import, no theme change. No PR was merged or created.

## Summary

| | Count |
|---|---|
| Checks answered from the public site | 11 (in full or in part) |
| Checks that need the owner (server script or Admin/dashboard view) | I1–I10, I12, I14–I31 (the server half of I13 too) |
| **New findings that change the plan** | **4** (F11 is High) |
| New risks added | R28–R31 |
| New owner decisions | O30, O31 |

## 1. What the live site is today (inventory, I27)

| Item | Found | Evidence |
|---|---|---|
| Ghost version | **6.75** | `<meta name="generator" content="Ghost 6.75">`, `/members/api/site/` |
| Web server | nginx 1.24.0 (Ubuntu), answering directly | `server` response header |
| Active theme | **Source** (Ghost's default) | `/assets/built/source.js`, `screen.css` |
| Site title / language | "Him & Me Mens Health" / `ms` (`<html lang="ms">`) | Homepage |
| Site description | "Utamakan kesihatan anda bersama Him & Me. Terokai perkhidmatan kesihatan lelaki dan dapatkan konsultasi profesional. Buat temu janji hari ini." | `llms.txt` |
| Site icon | Set (`him-and-me-icon.png`) | `/favicon.ico` redirects to it |
| Social image | **Ghost's default cover** (`static.ghost.org/…/publication-cover.jpg`) | `og:image` |
| Content | Ghost **starter content** only: post `/coming-soon/`, page `/about/` (default text inviting subscriptions and newsletters, "launched in November 2026 by Dr Imran"), tag `/tag/news/`, author `/author/dr/` | Sitemaps, `llms.txt` |
| Staff slug of the author | **`dr`** ("Dr Imran") | `/author/dr/`, `sitemap-authors.xml` |
| Members / sign-up | **Open:** `allow_external_signup: true`, Portal script loaded, "subscribe" links in the content | `/members/api/site/`, homepage |
| Search | Ghost's search script loaded, with the public Content API key in the page | Homepage source (key not copied here) |
| ActivityPub / Network | `/.well-known/webfinger` and the actor URL return **403** | Indicates Network is not active; confirm in Admin (I28) |
| Analytics | No third-party analytics script found (Google, Plausible, Cloudflare, Meta, Clarity, Umami: 0 matches) | Homepage source |
| `llms.txt`, `llms-full.txt`, `.md` versions | **On** (Ghost 6 default): `/llms.txt` 200, `/coming-soon.md` 200 | See F11 |
| `robots.txt` | Ghost's public default, with a `Sitemap:` line | 200 |
| Private paths | `/config.production.json` 404, `/.git/` 404, `/content/data/` 404 | ✓ |

**URLs public today (input for C10 and O20):**

| URL | After the new routes |
|---|---|
| `https://himandme.my/` | The new homepage |
| `https://himandme.my/about/` | Stays live until unpublished (O19) |
| `https://himandme.my/coming-soon/` | Moves to `/blog/coming-soon/` if left published (it would then show on the blog). Unpublish recommended (O19) |
| `https://himandme.my/tag/news/` | 404 (topics move to `/blog/topik/…`) |
| `https://himandme.my/author/dr/` | 404 (the archive moves to `/blog/penulis/dr/`) |

**Suggestion for O20 (your decision):**
- `/author/dr/` → 301 to `/blog/penulis/dr/`
- `/tag/news/` → `/blog/`
- `/about/` and `/coming-soon/` → `/`, once unpublished

The site launched in November 2026 with starter content only, so search-engine impact is small either way.

## 2. Findings that change the plan

### F11 (High): Ghost 6.75 serves every `#blok` block as Markdown
Ghost 6.40+ adds "LLM" features, **on by default** and on in production today: `/llms.txt`, `/llms-full.txt` and a Markdown copy of each post at `{post URL}.md`. Stage 1 predates them. **Measured on local Ghost 6.75.0** (GET requests only; settings restored afterwards):

| Request | Feature on (default) | Feature off | Private mode |
|---|---|---|---|
| `/blog/blok-utama-hero.md` (all 23 blocks tested) | **200, the block's text, 23 of 23** (the block's HTML page is 404) | 302 → `/404/`, 404 | 302 → `/private/` |
| `/llms.txt`, `/llms-full.txt` | 200; **no block listed** (0 block slugs) | 302 → `/` | 302 → `/private/` |
| An article's `.md` | 200 | 302 → the article page | 302 → `/private/` |

- **Off switch:** Ghost Admin → **Settings → General settings → Meta data → "Enable structured data for LLMs and AI search engines"** (setting `llms_enabled`). Turning it off closes the block leak.
- **What is lost:** `llms.txt` and the article `.md` copies. Normal SEO (sitemap, meta, JSON-LD) is unaffected.
- **During the migration:** private mode already covers it.
- **After launch (H1):** it must be **off**, or the blocks would be readable at `/blog/{block-slug}.md` by anyone who guesses a slug.
- **Plan changes:** new E12 (turn off, Phase E, before H1), §7.2 checks, R28, a G11 automated test (Phase B), and owner decision **O30**.

### F3 (Medium): `https://www.himandme.my` gives a certificate error
- `www` resolves and accepts connections, but the certificate covers **only `himandme.my`**: Let's Encrypt (YR2), valid 5 Nov 2026 – 3 Feb 2027.
- Visitors typing `www.` see a browser security warning. D2b/H3 would fail on the www variant.
- **Fix options (owner decision O31; not authorised now):**
  - (a) add `www.himandme.my` to the certificate and 301 it to the apex in Nginx;
  - (b) proxy `www` through Cloudflare with a redirect rule;
  - (c) remove the `www` DNS record.

  Each is a production or DNS change for Phase E.

### F4 (confirmed in revision 5): Cloudflare is DNS-only (not proxying)

> **Revision 5 update:** confirmed by I22. Both names resolve straight to the server's own address. See plan §14.
- Responses come straight from nginx: no `server: cloudflare`, no `cf-ray`, no `cf-cache-status`. The site seems not to pass through Cloudflare's proxy (the "grey cloud").
- **If I22 confirms this in the dashboard:**
  - there is no Cloudflare cache, so the D2/H2 purges are harmless no-ops and D2b's `cf-cache-status` check is "absent = pass" (R26 becomes Low);
  - SSL mode (I23), Rocket Loader and cache rules (I24) don't apply;
  - the server's IP address is public, and the firewall (I18) is the only protection in front of it.
- No change is proposed. This is information for O31 and the risk register.

### F8 (Medium): member sign-up is open on the live site
- Portal and `allow_external_signup` are on, and the default About page and post invite visitors to subscribe.
- Any sign-ups already collected are personal data (PDPA), and the planned site has **no** memberships (E2).
- **Check the member count in Admin (I29).** Decide what happens to any existing members before E2 sets "Nobody" (O18).

### Other public results

| ID | Result |
|---|---|
| I11 | Let's Encrypt certificate for `himandme.my`, valid until **3 Feb 2027** (renewal check: I12, from the server script) |
| I13 | `https://himandme.my/` 200. `www` fails TLS (F3). `http://` could not be tested from this session; covered by the server script |
| I28 | ActivityPub endpoints 403: Network looks inactive. Confirm the toggle in Admin |
| §7.3 | `X-Content-Type-Options: nosniff` ✓; `X-Frame-Options: sameorigin` on `/ghost/` ✓; **no HSTS and no `Referrer-Policy`** (R31, Low; an Nginx change for Phase E) |
| AS5 | Confirmed: the public Content API key is already in the live page source (normal for Ghost). It was not copied into any document |
| O4 | The production staff slug is **`dr`**, the same as the placeholder in `routes.yaml`. If you keep it, the routes file needs no slug change (the release check still runs) |
| O17 | A site icon already exists; the social image is still Ghost's default |

## 3. What the owner needs to run or look at

**A. Server (one read-only script):** [`docs/stage-7/phase-a-server-checks.sh`](phase-a-server-checks.sh). It covers I1–I21 and I30.
- **What it does:** it only reads. No restart, no fix, no update. It writes one report file, `~/phase-a-report.txt`.
- **Secrets:** it prints the Ghost config with every password, key, token, auth and user field replaced by `[removed]`. This was tested on a sample file.
- **Before sharing:** read the report first. Send it, or say "matches/differs" per item.

```bash
bash phase-a-server-checks.sh
```

**B. Ghost Admin (look only; change nothing):**

| ID | Where | Note down |
|---|---|---|
| I26 | Settings → Email newsletter / mail | Whether staff password-reset mail works (no test send needed) |
| I28 | Settings → Growth → Network | On or off |
| I29 | Members (left menu) and Settings → Membership → Access | Number of members; current access setting |
| I31 | Settings → Staff | Which account is **Owner**; all staff names and slugs |
| E10 | Settings → Integrations | List of custom integrations (names only, never keys) |
| F11 | Settings → General settings → Meta data | Whether "Enable structured data for LLMs and AI search engines" is on |

**C. Cloudflare dashboard (look only; change nothing):**

| ID | Where | Note down |
|---|---|---|
| I22 | DNS → Records | `himandme.my` and `www`: type, and proxy status (orange or grey cloud) |
| I23–I25 | SSL/TLS, Caching, Rules, Security | Only if proxied (orange): SSL mode, Always Online, cache rules, WAF |

**D. Tencent Cloud console (look only):** the security-group rules for the instance (I18): which ports are open to the internet.

## 4. Decisions now waiting for you
- **New, O30:** turn off "Enable structured data for LLMs and AI search engines" before launch (recommended; required to keep `#blok` blocks unreachable). The cost is losing `llms.txt` and the article `.md` copies.
- **New, O31:** how to handle `www` (F3): certificate + redirect, Cloudflare redirect, or remove the record.
- **O4:** keep the staff slug `dr`, or choose another.
- **O18/O19:** existing members (if any); unpublish the starter post and About page.
- **O20:** the redirect suggestions above.
- **O27, O28:** unchanged.
- **The rest of the checklist, section 4:** content, profile, business facts, analytics.

## 5. Updated risk register (changes only; the full table is in the plan, §10)

| ID | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| **R28** | Ghost's LLM features serve every block as Markdown at `/blog/{slug}.md` after launch | **High** | E12: turn the setting off before H1 (tested locally: blocks then 404); §7.2 checks; G11 test; private mode covers it until H1 | ✋ O30 |
| **R29** | `www.himandme.my` certificate error | Medium | O31 fix in Phase E; D2b/H3 www checks | ✋ O31 |
| **R30** | Members sign-up open on the live site; existing members' personal data | Medium | I29 count; O18 decision before E2 | 🔍 / ✋ |
| **R31** | No HSTS or Referrer-Policy header | Low | Add in Nginx (Phase E, after approval) | ✅ Planned |
| R26 | Cloudflare cached pages | **Low** (DNS-only confirmed) | D2b unchanged | ✅ |
| R7, R8 | Cloudflare SSL, Rocket Loader, cache | **n/a** (DNS-only confirmed) | I22–I24 | ✅ |

**Phase A remains open** until the server report and the Admin/dashboard notes come back. I will then review them, complete the audit and the risk register, and present the full Phase A result. **Nothing in Phase B will start without your separate written approval.**
