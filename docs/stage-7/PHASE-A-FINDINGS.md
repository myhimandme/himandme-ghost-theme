# Stage 7, Phase A findings (read-only audit)

> **Current status (18 Nov 2026):** Phase A is **still open** (outstanding work in the summary below).
> - Phases B–H remain **unauthorised**, and Phase B needs separate written approval.
> - No further production changes are authorised.
>
> **Historical status of this first pass (17 Nov 2026):** "Phase A, first pass. Waiting for the owner's server and Admin results." The server results have since been received and reconciled into `docs/STAGE-7-PLAN.md` §14. The Admin results are still outstanding.
>
> **Update 18 Nov 2026 (verified outcomes of the owner's separate maintenance, as reported by the owner; details in plan §15):**
> - **F3 (www certificate error): resolved on 18 Nov** by M4 N1–N3, after **O31 was approved as Option A** (separate www certificate + redirect). www now 301s to `https://himandme.my` over HTTP and HTTPS with its own certificate; the apex certificate is unchanged. **R29: mitigated.**
> - **Security headers (R31):** **N5 completed** on 18 Nov; **N6 remains pending** observation (review around 25 Nov 2026). HSTS stays at **`max-age=300`**.
> - **F4 (DNS-only), F8 (member sign-up open) and F11 (Markdown copies of blocks, O30):** unchanged; still open for their decisions.
> - **Mail, SSH and updates:** M1, M2 and M3 completed (plan §15.2–15.4).
>
> **What was done:** read-only checks only.
> - Anonymous HTTPS **GET** requests to `https://himandme.my` from this session. Access was enabled for this purpose through a new personal environment, "Him & Me website", that allows only himandme.my and www.himandme.my.
> - Tests on the **local** Ghost 6.75.0.
>
> **Nothing was changed on production during this 17 Nov 2026 audit** (it was read-only): no login, no Admin, no SSH, no DNS or Cloudflare change, no backup, no import, no theme change, and no PR merged or created. The findings below are kept as a historical record. **The owner separately changed the server on 18 Nov 2026** (maintenance M1–M3 and M4 N1–N5): see the update note above and `docs/STAGE-7-PLAN.md` §15.

## Summary

**As recorded on 17 Nov 2026 (first pass, historical):**

| | Count |
|---|---|
| Checks answered from the public site | 11 (in full or in part) |
| Checks that needed the owner at that time (server script or Admin/dashboard view) | I1–I10, I12, I14–I31 (the server half of I13 too) |
| **New findings that change the plan** | **4** (F11 is High) |
| New risks added | R28–R31 |
| New owner decisions | O30, O31 |

**Current status (18 Nov 2026), superseded in part by the 19 Nov update below:**

| | Status |
|---|---|
| Server checks (I1–I21, I30) | **Received and reconciled** (17 Nov; plan §14). The findings were acted on in the owner's maintenance on 18 Nov (M1–M3, M4 N1–N5; plan §15) |
| I22–I25 (Cloudflare) | Answered: **DNS-only** (I22); I23–I25 not applicable |
| **Outstanding: Ghost Admin checks** | I27 (Admin part: drafts, routes, redirects), I28 (Network), I29 (members and access), I31 (staff and Owner), plus the integrations and LLM-setting views |
| **Outstanding: Tencent security-group review** | I18 (second half; ufw already ✅) |
| **Outstanding: server follow-ups** | I32 (fail2ban `sshd` jail details), I33 (the rest of `ssl-params.conf`; its HSTS line is known), I34 (confirming the 5 historical logins) |
| **Tracked separately: N6** | A read-only HSTS observation review around **25 Nov 2026** (plan §15.5, §15.8 B); HSTS stays `max-age=300` |
| Phase A | **Open** until the outstanding items above are done; **Phases B–H unauthorised** |

**Update 19 Nov 2026 (owner's read-only checks; consolidated in `docs/STAGE-7-PLAN.md` §16):**

| Item | Result |
|---|---|
| Ghost Admin (I27, I28, I29, I31, integrations) | ✅ **Done:** 0 drafts or scheduled posts/pages; default routes; empty redirects; Network **OFF**; 0 members, subscriptions Nobody, comments Nobody; only staff = Dr Imran (Owner, `dr`); no custom integrations |
| LLM setting | ⚠️ **ON** (R28; O30), not changed |
| Staff-wide email 2FA | ⚠️ **OFF**, a security observation (R39; O38), not changed |
| Tencent firewall (I18) | ✅ **Done:** TCP 443/22/80 + ICMP allowed (IPv4); no 3306 or 2368 |
| I32 | ✅ **Done:** fail2ban active, 1 jail; 262 total failed, 6 total banned |
| I33 | ⚠️ **Done, finding:** TLS 1.0/1.1 and legacy ciphers permitted (R40; O37), not changed |
| I34 | ⚠️ **Unresolved:** 8 accepted password logins (17–18 Nov) not all confirmed; **not a confirmed breach** (R41; O39) |
| N6 | ⏳ Read-only review around 25 Nov 2026; HSTS `max-age=300` |
| Phase A | **Open** until the owner reviews these findings and I34 is resolved or decided; **Phases B–H unauthorised** |

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

> **Current status (18 Nov 2026), added later:** O31 was approved as **Option A**. F3 was resolved by M4 N1–N3 (see the update note at the top and `docs/STAGE-7-PLAN.md` §15.5). The evidence above is kept unchanged as the 17 Nov record.

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
| I13 | `https://himandme.my/` 200. `www` fails TLS (F3). `http://` could not be tested from this session; covered by the server script. *Current status (18 Nov): www fixed (M4 N1–N3)* |
| I28 | ActivityPub endpoints 403: Network looks inactive. Confirm the toggle in Admin |
| §7.3 | `X-Content-Type-Options: nosniff` ✓; `X-Frame-Options: sameorigin` on `/ghost/` ✓; **no HSTS and no `Referrer-Policy`** (R31, Low; an Nginx change for Phase E). *Current status (18 Nov): headers set by M4 N5; HSTS `max-age=300`; N6 pending (plan §15.5)* |
| AS5 | Confirmed: the public Content API key is already in the live page source (normal for Ghost). It was not copied into any document |
| O4 | The production staff slug is **`dr`**, the same as the placeholder in `routes.yaml`. If you keep it, the routes file needs no slug change (the release check still runs) |
| O17 | A site icon already exists; the social image is still Ghost's default |

## 3. What the owner needs to run or look at

> **Current status:** the server script results (A) were received on 17 Nov and reconciled into `docs/STAGE-7-PLAN.md` §14. B (Ghost Admin) and D (Tencent) are still outstanding. C (Cloudflare) is answered by I22: DNS-only, so the dashboard view is optional.

**A. Server (one read-only script): ✅ COMPLETED, results received.** The owner ran the script and the report was received on **17 Nov 2026**, then reconciled into `docs/STAGE-7-PLAN.md` §14. **The script does not need to be run again.** The original instructions below are kept unchanged as an audit record.

*Original instructions (17 Nov 2026, historical):* [`docs/stage-7/phase-a-server-checks.sh`](phase-a-server-checks.sh). It covers I1–I21 and I30.
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
| I27 (Admin part) | **Posts** and **Pages** lists filtered to **Drafts** and **Scheduled**; **Settings → Advanced → Labs → Open → Beta features → Routes → Download** and, in the same Labs section, **Redirects → Download** | The number and titles of draft and scheduled posts and pages. Whether the current `routes.yaml` is Ghost's default or customised (keep the downloaded copy privately). Whether a redirects file exists, and its entries. **Look and download only:** do not upload, edit, publish, unpublish or delete anything. *The published content (posts, pages, tag, author, theme) was already inventoried read-only from the public site on 17 Nov (§1); this row covers only what the public site cannot show* |
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
- **New, O31:** how to handle `www` (F3): certificate + redirect, Cloudflare redirect, or remove the record. *Decided 18 Nov: **Option A**, executed in M4 N1–N3.*
- **O4:** keep the staff slug `dr`, or choose another.
- **O18/O19:** existing members (if any); unpublish the starter post and About page.
- **O20:** the redirect suggestions above.
- **O27, O28:** unchanged.
- **The rest of the checklist, section 4:** content, profile, business facts, analytics.

## 5. Updated risk register (changes only; the full table is in the plan, §10)

*Statuses as of 18 Nov 2026. The risk descriptions are the 17 Nov findings.*

| ID | Risk | Severity | Mitigation | Status |
|---|---|---|---|---|
| **R28** | Ghost's LLM features serve every block as Markdown at `/blog/{slug}.md` after launch | **High** | E12: turn the setting off before H1 (tested locally: blocks then 404); §7.2 checks; G11 test; private mode covers it until H1 | ✋ O30 |
| **R29** | `www.himandme.my` certificate error | Medium | O31 = Option A, executed in M4 N1–N3 (18 Nov) | ✅ **Mitigated** (18 Nov) |
| **R30** | Members sign-up open on the live site; existing members' personal data | Medium | I29 count; O18 decision before E2 | 🔍 / ✋ |
| **R31** | No HSTS or Referrer-Policy header | Low | Headers set by M4 N5 (18 Nov); HSTS held at `max-age=300`; one-year value only after the N6 review | ◐ **N5 completed; N6 pending** observation (around 25 Nov) |
| R26 | Cloudflare cached pages | **Low** (DNS-only confirmed) | D2b unchanged | ✅ |
| R7, R8 | Cloudflare SSL, Rocket Loader, cache | **n/a** (DNS-only confirmed) | I22–I24 | ✅ |

**Phase A status (18 Nov 2026):** the server investigation results have been **received and reconciled** into `docs/STAGE-7-PLAN.md` §14 (and the 18 Nov maintenance into §15).

**Phase A remains open** for:
- the outstanding **Ghost Admin** checks (Network, members, staff/Owner, integrations, the LLM setting);
- the **Tencent security-group** review;
- **I32–I34:** fail2ban `sshd` jail details, the rest of `ssl-params.conf`, and confirmation of the 5 historical logins.

The **N6 observation** is a **separate** pending read-only review, around 25 Nov 2026. **Phase B remains unauthorised** and requires separate written approval.

**Phase A status (19 Nov 2026):** the Ghost Admin, Tencent and I32–I34 checks above have been performed (see the 19 Nov update table near the top and plan §16). Phase A **remains open**:
- **I34** is unresolved;
- the new findings (R39 2FA, R40 TLS, R41 logins) and decisions O30 and O37–O39 await the owner's review.

No production change was made during these checks.
