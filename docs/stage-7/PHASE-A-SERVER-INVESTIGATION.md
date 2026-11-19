# Stage 7, Phase A: server investigation (read-only)

> **Phase A signed off by the owner, 19 Nov 2026** (`docs/STAGE-7-PLAN.md` §16.10).
>
> **Update 19 Nov 2026, read-only follow-ups (details in `docs/STAGE-7-PLAN.md` §16):**
> - **I32:** fail2ban active, 1 `sshd` jail; 262 total failed, 6 total banned.
> - **I33:** `ssl-params.conf` permits TLS 1.0/1.1 and legacy ciphers (R40, O37; not changed).
> - **I34 (as of Update 6.2):** 8 accepted password logins on 17–18 Nov not all confirmed by the owner. Unresolved, not a confirmed breach (R41, O39). Password login has been off since M2.
> - **I34 (Update 6.3): ✅ RESOLVED.**
>   - *Owner-confirmed:* all 8 password logins are the owner's own, as is the 17 Nov `sudo` activity; the later ED25519 key logins matched the owner's key and originated from the owner's confirmed connection (Ghost troubleshooting and configuration).
>   - *Technical (read-only output):* no unexpected interactive account; exactly one ED25519 key (`SHA256:B1ia0qxNC+8QAAfc8XGVkkEtuyREnFr0ipULkHVuEmk`); root cron = acme.sh + Tencent Stargate; `sgagent` and `tat_agent` are standard Tencent components (verified against Tencent docs; **do not remove**); public listeners only 22/80/443; MySQL 3306, Ghost 2368 and MySQL X 33060 on localhost.
>   - R41 closed; O39 done (plan §16.7).
>
> **Update 18 Nov 2026, maintenance executed by the owner (details in `docs/STAGE-7-PLAN.md` §15):**
>
> | Finding | Outcome |
> |---|---|
> | 1. SSH | ✅ **Resolved (M2):** key-only, root login off (`sshd -T` verified); recovery via passphrase-protected key, USB backup, Tencent VNC. Separate outstanding Phase A audit items: I32 (fail2ban `sshd` jail details) and I34 (confirming the 5 historical logins); these do not mean M2 failed |
> | 2. Updates and restart | ✅ **Resolved (M3):** snapshot `himandme-pre-m3-updates-2026-11-18`; 27 upgraded, 7 new, 0 removed, 2 phased deferred; rebooted to kernel 6.8.0-149. Automatic security updates (O35) not reported, still open |
> | 3. Mail and device verification | ✅ **Resolved (M1):** delivery, the second-browser verification email and the second-browser login all succeeded. Interim Gmail SMTP; replacement provider is a future item |
> | 4. www | ✅ **Resolved (M4 N1–N3):** www certificate (EC-256, to 16 Feb 2027) and 301s to the apex; apex certificate serial and fingerprint unchanged |
> | 5. Default site | ✅ **Resolved (M4 N4):** catch-all (444 / TLS handshake rejected) |
> | 6. Headers | ◐ **N5 done; N6 (HSTS) pending observation**, review around 25 Nov 2026 |
>
> **Status (17 Nov 2026): the ⏳ items below were resolved by `phase-a-investigation.txt` (13:32 UTC) and reconciled into `docs/STAGE-7-PLAN.md` §14 (revision 5). That section is the current reference.** Original analysis follows.
> **During this 17 Nov 2026 investigation** nothing was installed, upgraded, restarted, reloaded, edited or deleted (it was read-only). The remediations below are kept as the **historical recommendations** made at that time. The owner carried out the approved ones separately on 18 Nov 2026 (table above; plan §15). Phase B is not started.
>
> **Sources**
> - The owner's `phase-a-report.txt` (17 Nov 2026, 13:06 UTC).
> - The public read-only checks from the first Phase A pass.
>
> **What needs the second script:** the exact package list, the reboot reasons, the SSH config files, the Nginx default site and the acme.sh settings are not in the first report. They are collected by [`phase-a-investigation.sh`](phase-a-investigation.sh): same rules as before (read-only, no secrets; SSH keys appear only as fingerprints). Items that depend on it are marked **⏳ pending script**.

```bash
bash phase-a-investigation.sh      # writes ~/phase-a-investigation.txt; read it before sharing
```

The script does make two harmless network calls:
- It requests the site's own pages through `127.0.0.1` with different `Host` names, to see which Nginx server block answers.
- It opens and immediately closes a TCP connection to Google's mail servers (ports 25 and 587), to see whether this VPS can send mail at all. **No mail is sent.**

It does **not** run `apt update` (that would rewrite the package cache), so the package list reflects the cache date it prints.

## Summary

| # | Finding | Severity | Evidence | Fix needs |
|---|---|---|---|---|
| 1 | SSH: root login and password login allowed, port 22 open to the internet | **High** | Report I20, I18 | SSH **reload** (open sessions stay connected) |
| 2 | 23 security updates pending; restart required | **High** | Report I1, I21 | Package upgrade, then **reboot** (≈ 2–5 min downtime) |
| 3 | Ghost mail is `Direct` while staff device verification is on: risk of being **locked out of Ghost Admin** | **High** (for the launch) | Report I3 | Ghost config change + **Ghost restart** |
| 4 | `www.himandme.my`: HTTPS fails (certificate); HTTP answers 200 from the wrong server | Medium | Report I11, I13 | New certificate + Nginx **reload** |
| 5 | Nginx default site still enabled: a catch-all that answers any other host name | Low–Medium | Report I9, I10, I13 | Nginx **reload** |
| 6 | No HSTS, Referrer-Policy or Permissions-Policy headers | Low–Medium | Report I10; public headers | Nginx **reload** |
| 7 | Smaller configuration points (upload limits, ActivityPub proxy, report bug) | Low / info | Report I7, I10 | — |
| ✓ | Healthy: Ghost 6.75.0 (CLI 1.34.1), systemd, Node 22.23.4, ownership, MySQL 8.0.46 on localhost with `auth_socket` and utf8mb4, disk 14 % used, memory, firewall defaults, certificate renewal cron | — | Report I2–I19, I30 | — |

**Suggested order (all later, after approval):**
1. **Mail (3)** before anyone needs to log in from a new device.
2. **SSH (1).**
3. **Updates + reboot (2)**, in one short maintenance window **after a Tencent snapshot**.
4. **Nginx: www (4), default site (5), headers (6)** together, with one `nginx -t` and one reload.

All of these are **server maintenance**, separate from the theme launch. They would need their own written approval and could run before Phase C.

---

## 1. SSH allows root and password logins (High)

**Evidence**
- I20: `permitrootlogin yes`, `passwordauthentication yes`, `pubkeyauthentication yes`.
- I18: port 22 allowed from **anywhere** (IPv4 and IPv6).
- I19: port 22 is held by `systemd` and `sshd`. Ubuntu 24.04 uses socket activation (`ssh.socket`).

**Why it matters:** anyone on the internet can try passwords for `root`. One weak or reused password means full control of the server, the database and the site.

**⏳ Pending script (S1):**
- Which file sets these values. Ubuntu cloud images often have `/etc/ssh/sshd_config.d/50-cloud-init.conf` with `PasswordAuthentication yes`, and Tencent may add its own file.
- Which users have SSH keys (fingerprints only).
- Whether `ubuntu` is in the `sudo` group.
- The number of failed logins in 7 days.
- How you log in today: password or key.

**Recommended migration to key-only login.** Each step is checked before the next; nothing is done now.

1. **Break-glass access first.** In the Tencent Cloud console, confirm you can open the instance's browser terminal (VNC/OrcaTerm login). It works even if SSH is misconfigured. Do not continue until you have tried it once.
2. **A key for the `ubuntu` user** (a normal sudo user, not root). On Windows (PowerShell), if you have no key yet:

   ```bash
   ssh-keygen -t ed25519
   ```

   Then add the **public** key (`id_ed25519.pub`) to `/home/ubuntu/.ssh/authorized_keys` on the server. Never copy the private key anywhere.
3. **Prove key login works without a password**, from a new PowerShell window:

   ```bash
   ssh -o PreferredAuthentications=publickey -o PasswordAuthentication=no ubuntu@<server>
   ```

   Then run `sudo -v` inside that session. Both must succeed.
4. **Keep that session open** for the rest of the change. It is your safety line.
5. **Add one drop-in file**, `/etc/ssh/sshd_config.d/00-himandme-hardening.conf`. The `00` matters: sshd keeps the **first** value it reads, and the drop-ins are read in name order before `50-cloud-init.conf`.

   ```
   PermitRootLogin no
   PasswordAuthentication no
   KbdInteractiveAuthentication no
   PubkeyAuthentication yes
   ```

6. **Validate:** `sudo sshd -t` (no output = OK), then `sudo sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractive)'` must show `no`, `no`, `no`.
7. **Apply:** `sudo systemctl reload ssh`. Existing sessions are **not** disconnected. The port is not changed, so `ssh.socket` is untouched.
8. **Test from a second window:**
   - key login works (step 3 again);
   - a password attempt is refused: `ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password ubuntu@<server>` must say **"Permission denied (publickey)"**;
   - `ssh root@<server>` is refused.
9. **Rollback:** delete the drop-in file and `sudo systemctl reload ssh`, from the open session or the Tencent console.

**Optional, later:**
- fail2ban (rate-limits repeated failures);
- restricting port 22 in the Tencent security group to your own IP addresses, if they are stable.

**Restart or reload:** an SSH **reload** only. No Ghost, Nginx or MySQL impact.

## 2. Pending updates and restart required (High)

**Evidence**
- I21: 27 upgradable packages, **23 from the security pocket**.
- I1: `REBOOT REQUIRED`.
- Uptime 12 days.
- MySQL is `8.0.46-0ubuntu0.24.04.4`, while Ubuntu already ships `…04.5` (the local rehearsal used .5), so at least the MySQL server is among the pending updates.

**⏳ Pending script (U1, U2):**
- the exact 27 packages with current → new versions, split into security and other;
- `/var/run/reboot-required.pkgs` (the packages that asked for the reboot, usually a newer kernel or `linux-base`/`systemd`/`libc`);
- installed kernels versus the running `6.8.0-138-generic`;
- services still using replaced libraries (`needrestart -r l`, list only);
- whether automatic security updates (`unattended-upgrades`) are enabled. 23 pending security updates suggests they are not running, or are held back.

**Recommended remediation (a maintenance window, after approval):**
1. Tencent snapshot (same as C1).
2. `sudo apt update && sudo apt upgrade` (review the list first).
3. `sudo reboot`.
4. Check:
   - `ghost ls` shows running;
   - `https://himandme.my/` returns 200;
   - `sudo nginx -t`;
   - `systemctl is-active mysql`.

**Effects to expect:**
- **MySQL** upgrades restart MySQL: Ghost shows errors for a few seconds.
- **Nginx** upgrades restart Nginx.
- **OpenSSH** upgrades restart sshd; open sessions survive.
- **Node.js** (NodeSource package) upgrades take effect at the next Ghost restart. Ghost 6.75.0 needs Node `^22.23.1`, so any 22.x update is fine; a jump to 24.x would also be supported (`^24.20.0`), but must not happen by accident.
- The `ghost_himandme-my` service is **enabled** (I6), so Ghost starts again after the reboot.

**Total downtime:** about 2–5 minutes.

**Restart or reload:** a full **reboot**.

## 3. Ghost mail is "Direct" with staff device verification on (High for the launch)

**Evidence (I3):** `mail.transport: "Direct"`, no SMTP host, and `security.staffDeviceVerification: true`.

**Why it matters**
- With staff device verification, Ghost emails a code whenever a staff member logs in from a **new browser or device**.
- "Direct" sends mail straight from the VPS. That is often blocked: many cloud providers block outbound port 25, Tencent included, by default. Where it isn't blocked, the mail is usually rejected or lands in spam.
- **If the code never arrives, you cannot log in to Ghost Admin from a new device**, for example during the launch window. Password resets fail the same way.

**⏳ Pending script (M1):**
- whether outbound port 25 and port 587 are open from this VPS;
- the count of mail errors in Ghost's logs.

**Recommended remediation (owner decision):**
- configure a transactional mail service via SMTP (Mailgun, Amazon SES, Brevo, Postmark or Zoho; an account you own). This changes `mail` in `config.production.json` with `ghost config` and needs a **Ghost restart**.
- The SMTP password is entered on the server only, never in chat or the repository.

**Before Phase D:**
- confirm you can still log in from your **current** browser;
- send a staff invite or password reset to yourself as a test.

**Not recommended:** turning device verification off. It is a security feature.

**Restart or reload:** a Ghost restart (`ghost restart`, ≈ 10 s).

## 4. www.himandme.my (Medium)

**Evidence**
- I11: for `www`, the server presents the apex certificate (`DNS:himandme.my` only).
- I13 (from the server, through DNS):
  - `https://www.himandme.my/` fails with *"no alternative certificate subject name matches"*;
  - `http://www.himandme.my/` returns **200 with no redirect**.
- I10: both Him & Me server blocks have `server_name himandme.my` only.

So `http://www…` is not answered by Ghost but by the **Nginx default site** (finding 5). That is most likely the "Welcome to nginx" page; ⏳ the script (N1) records the page title.
- `www` therefore resolves to this server (Cloudflare DNS-only, as the public check suggested).

**Renewal today (I12)**
- acme.sh in `/etc/letsencrypt`, run from root's cron 4 times a day, with the certificate in `/etc/letsencrypt/himandme.my/`. This is Ghost-CLI's standard setup.
- The current certificate runs 5 Nov 2026 – 3 Feb 2027; acme.sh renews about 30 days before expiry.
- ⏳ The script (C1) confirms the webroot, the reload command and the next renewal date.

**Options to cover www**

| Option | What | Pros | Cons |
|---|---|---|---|
| **A (recommended)** | A **separate** certificate for `www.himandme.my` (acme.sh, same webroot method), plus small Nginx server blocks for `www` on 80 and 443 that only **301 to `https://himandme.my$request_uri`** | Leaves the working apex certificate and Ghost-CLI's files untouched; the existing cron renews it too; easy rollback (remove the two blocks, reload) | Two certificates to watch instead of one |
| B | Re-issue the apex certificate with both names (SAN) | One certificate | Changes the certificate Ghost-CLI manages; a later `ghost setup ssl` could reissue it without www |
| C | Remove the `www` DNS record | Simplest | People typing `www.` get nothing; it is a DNS change |

**Option A steps (later, after approval):**
1. Add a port-80 `server_name www.himandme.my` block that serves `/.well-known/acme-challenge/` from the same webroot as the apex (from C1) and 301-redirects everything else to `https://himandme.my$request_uri`. Run `nginx -t`, then reload.
2. Issue the certificate:

   ```bash
   sudo /etc/letsencrypt/acme.sh --issue --home /etc/letsencrypt -d www.himandme.my -w <webroot> --reloadcmd "systemctl reload nginx"
   ```

   If issuance fails, nothing changes.
3. Add the port-443 `www` block using that certificate, with a 301 to the apex. Run `nginx -t`, then reload.
4. Test:
   - `https://www.himandme.my/x` → 301 to `https://himandme.my/x`;
   - `http://www…` → 301;
   - a certificate check shows `DNS:www.himandme.my`.

**Restart or reload:** an Nginx **reload** only. No Ghost restart.

## 5. Nginx default site still enabled (Low–Medium)

**Evidence**
- I9: `sites-enabled/default` points to `sites-available/default`.
- I10: `server_name _` at line 46, i.e. Ubuntu's stock catch-all, normally `listen 80 default_server`, root `/var/www/html`.
- I13: `http://www.himandme.my/` returns 200 from it.

**Actual exposure**
- **Port 80:** any request whose host is not `himandme.my` gets the default page. That covers `www`, the bare IP, and any other domain someone points at the server. ⏳ N1 shows exactly which page and lists `/var/www/html`.
  - If it holds only Ubuntu's `index.nginx-debian.html`, the exposure is small: it reveals Nginx/Ubuntu, makes `www` look broken, and lets anyone host-spoof a 200 page.
  - If anything else is in `/var/www/html`, it is public.
- **Port 443:** the stock default site has no HTTPS block, so Nginx uses the **first** HTTPS block, Him & Me's, as the implicit default. Any host name over HTTPS, including the bare IP, reaches **Ghost** with a mismatched certificate. ⏳ N1 confirms.

**Recommended remediation (with finding 4, one reload):**
1. Disable the stock site (remove the `sites-enabled/default` **link only**; keep the file).
2. Add an explicit catch-all:
   - port 80 `default_server`: `return 444;`
   - port 443 `default_server`: `ssl_reject_handshake on;` (supported since Nginx 1.19.4; the server runs 1.24.0).

   Unknown hosts then get nothing.
3. Do this **after** the `www` blocks exist, so `www` is handled explicitly.
4. Run `nginx -t`, then reload.

**Restart or reload:** an Nginx **reload**.

## 6. Security headers (Low–Medium)

**Evidence**
- Live headers: only `X-Content-Type-Options: nosniff`. `X-Frame-Options: sameorigin` comes from Ghost on `/ghost/` only.
- I10: the Him & Me files set `add_header X-Content-Type-Options $header_content_type_options` **inside each `location` block** (Ghost-CLI template).

**Conflict to avoid:** in Nginx, a `location` that has its own `add_header` **ignores every `add_header` from the server level**. Headers added at server level would silently not apply to the main `location /`. They must go into each location that already has `add_header`, preferably through one snippet file included in each.

**Recommended values** (`/etc/nginx/snippets/himandme-security-headers.conf`, included in each HTTPS location):

```
add_header Strict-Transport-Security "max-age=300" always;   # step 1; raise to 31536000 after a clean week
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

- **HSTS:** start short (5 minutes), raise to 1 year once HTTPS is confirmed everywhere, `www` included (finding 4).
  - Add `includeSubDomains` only when **every** subdomain has HTTPS.
  - **No `preload`** for now: it is very hard to undo.
- **X-Frame-Options:** Ghost already sends it on `/ghost/`. To avoid two copies there, add `proxy_hide_header X-Frame-Options;` in that location or leave it out of `/ghost/`.
- **Keep** the existing `X-Content-Type-Options` line as it is.
- **Content-Security-Policy: not now.** Ghost Admin, Portal, the search script and the theme's inline script need a carefully tested policy. It could be added later, report-only first, for the public pages.
- **Check after the reload:** `curl -sI https://himandme.my/` and `https://himandme.my/ghost/` show each header once.

**Restart or reload:** an Nginx **reload**.

## 7. Smaller points (Low / information)

| Point | Evidence | Assessment |
|---|---|---|
| HTTP block proxies to Ghost instead of redirecting in Nginx | I10 (`proxy_pass` in `himandme.my.conf`), I13 (`http://` → 301) | Ghost itself issues the 301 (Ghost-CLI default). Works; optional later: `return 301 https://…` in Nginx, keeping the ACME challenge location |
| Upload limit differs: 50 MB (HTTP) vs 1 GB (HTTPS) | I10 lines 55 | Harmless (Admin is used over HTTPS); 1 GB is generous but Ghost's own limits apply |
| ActivityPub proxy locations present | I10 (`proxy_pass $activitypub_upstream`) | Ghost-CLI default. With Network off (I28), they lead nowhere (403 seen publicly). No action |
| I7 shows "count: 1" | I7 says `-- No entries --` | **Zero errors**: my first script counted journalctl's "-- No entries --" line. Noted; no server issue |
| Install folder owned by `ubuntu`, `content/` by `ghost` | I8 | Correct for Ghost-CLI |
| MySQL root uses `auth_socket`; database `himandme`, 4.3 MB, utf8mb4_0900_ai_ci | I30 | Confirms AS3: `sudo mysqldump` needs no password; C4 can use `DB=himandme` |
| Swap 1.9 GB, 2.2 GB RAM available | I17 | Fine |
| Tencent security group | not in the report | Still to view in the console (I18, second half) |

## Effect on the Stage 7 plan (proposed; applied after your review)
- **New risks:**
  - R32: SSH root/password login (High).
  - R33: pending security updates and reboot (High).
  - R34: Admin lock-out from Direct mail with device verification (High).
  - R35: Nginx catch-all (Low–Medium).
  - R29 (www) and R31 (headers) are updated with this evidence.
- **AS1–AS3 confirmed:** Ubuntu 24.04.5, Ghost 6.75.0, CLI 1.34.1, MySQL 8.0.46, Node 22.23.4, standard layout, socket-authenticated root.
- **C4 and rollback level 3:** the database name is `himandme`.
- **New decisions:**
  - O32: SSH migration.
  - O33: the update and reboot window.
  - O34: the mail provider.
  - O31 (www): option A recommended.
- **I-rows answered:** I1–I21 and I30, with the details pending the script.

*(Historical, 17 Nov 2026:)* Waiting for `phase-a-investigation.txt` to complete the ⏳ items, then for your approval. Nothing had been changed at that point. *(18 Nov 2026: maintenance M1–M3 and M4 N1–N5 done by the owner; see the table at the top. Phase B is still not started.)*
