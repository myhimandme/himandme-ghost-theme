#!/usr/bin/env bash
# Regression tests for the Phase C scripts (docs/stage-7/phase-c-backup.sh and phase-c-restore-test.sh).
# Fully offline: a temporary folder stands in for the server and the Windows backup folder, and stub commands
# replace sudo, mysqldump, mysql, ghost and curl. Nothing touches production.
#   bash test/phase-c/scripts.test.sh
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_SH="$ROOT/docs/stage-7/phase-c-backup.sh"
RESTORE_SH="$ROOT/docs/stage-7/phase-c-restore-test.sh"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
pass=0; failn=0
check() { if [ "$2" = 0 ]; then pass=$((pass+1)); echo "✓ $1"; else failn=$((failn+1)); echo "✗ $1"; [ -n "${3:-}" ] && echo "    $3"; fi; }
ok() { "$@" >/dev/null 2>&1; echo $?; }

# ---------- fixtures ----------
mkdir -p "$T"/{bin,gh/content/{settings,themes/source,images,logs},etc/nginx/sites-available,zipsrc/{data,images,themes,settings},fx}
echo "routes: {}" > "$T/gh/content/settings/routes.yaml"; echo x > "$T/gh/content/themes/source/index.hbs"; echo log > "$T/gh/content/logs/a.log"
echo "server{}" > "$T/etc/nginx/sites-available/himandme.conf"; echo conf > "$T/etc/nginx/nginx.conf"
echo '{}' > "$T/zipsrc/data/export.json"; for d in images themes settings; do echo x > "$T/zipsrc/$d/f"; done
S=https://himandme.my
sm() { printf '<?xml version="1.0"?><urlset>'; for u in "$@"; do printf '<url><loc>%s</loc></url>' "$u"; done; printf '</urlset>'; }
printf '<?xml version="1.0"?><sitemapindex>' > "$T/fx/sitemap.xml"
for s in pages posts authors tags; do printf '<sitemap><loc>%s/sitemap-%s.xml</loc></sitemap>' "$S" "$s" >> "$T/fx/sitemap.xml"; done
echo '</sitemapindex>' >> "$T/fx/sitemap.xml"
sm "$S/coming-soon/" > "$T/fx/sitemap-posts.xml"; sm "$S/" "$S/about/" > "$T/fx/sitemap-pages.xml"
sm "$S/tag/news/" > "$T/fx/sitemap-tags.xml"; sm "$S/author/dr/" > "$T/fx/sitemap-authors.xml"

cat > "$T/bin/sudo" <<'X'
#!/bin/bash
[ "$1" = chown ] && exit 0
exec "$@"
X
cat > "$T/bin/mysqldump" <<'X'
#!/bin/bash
[ -n "${DUMP_WARN:-}" ] && echo "Warning: something" >&2
printf -- '-- MySQL dump\nCREATE TABLE `posts` (id int);\n-- Dump completed on 2026-11-23\n'
X
cat > "$T/bin/mysql" <<'X'
#!/bin/bash
case "$*" in
  --version) echo "mysql  Ver 8.0.46";;
  *"FROM ghost_restore_test.posts"*) echo 9;;
  *information_schema*) echo 103;;
  *active_theme*) echo source;;
  *DATABASE*) ;;
  *-N*-B*) cat >/dev/null; printf 'posts_rows\t9\ntables\t103\ncharset_collation\tutf8mb4\tutf8mb4_0900_ai_ci\nactive_theme\t%s\n' "${REF_THEME:-source}";;
  *) cat >/dev/null;;
esac
X
printf '#!/bin/bash\necho "Ghost-CLI version: 1.34.1"\n' > "$T/bin/ghost"
# curl stub: serves the fixtures; FAIL_URL (substring) answers FAIL_CODE, or exits with CURL_EXIT; HTML_URL serves HTML.
cat > "$T/bin/curl" <<X
#!/bin/bash
out=/dev/stdout; fmt=""; url=""
while [ \$# -gt 0 ]; do case "\$1" in -o) out="\$2"; shift;; -w) fmt="\$2"; shift;; --max-time) shift;; -*) ;; *) url="\$1";; esac; shift; done
name="\${url##*/}"; code=200
if [ -n "\${FAIL_URL:-}" ] && [[ "\$url" == *"\$FAIL_URL"* ]]; then
  [ -n "\${CURL_EXIT:-}" ] && { echo "curl: (6) Could not resolve host" >&2; exit "\$CURL_EXIT"; }
  code="\${FAIL_CODE:-500}"; echo "<html>error</html>" > "\$out"
elif [ -n "\${HTML_URL:-}" ] && [[ "\$url" == *"\$HTML_URL"* ]]; then echo "<html>not a sitemap</html>" > "\$out"
else cat "$T/fx/\$name" > "\$out"; fi
[ -n "\$fmt" ] && printf '%s' "\$code"
exit 0
X
chmod +x "$T"/bin/*

newzip() { rm -f "$T"/gh/*.zip; (cd "$T/zipsrc" && zip -qr "$T/gh/backup-from-v6.75.0-on-2026-11-23-$1.zip" .); }
backup() { rm -rf "$T/home"; mkdir -p "$T/home"; sleep 1; HOME="$T/home" GHOST_DIR="$T/gh" ETC="$T/etc" PATH="$T/bin:$PATH" bash "$BACKUP_SH" "$@" </dev/null 2>&1; }
bkdir() { echo "$T"/home/backup/pre-launch-*; }

echo "== phase-c-backup.sh"
newzip a; zsum="$(sha256sum "$T"/gh/*.zip | cut -d' ' -f1)"
out="$(backup)"; rc=$?
check "B1 clean run passes" "$([ $rc = 0 ] && grep -q '^PHASE C SERVER BACKUP OK' <<<"$out"; echo $?)" "$(tail -3 <<<"$out")"
D="$(bkdir)"
expected="$(printf '%s\n' "$S/" "$S/about/" "$S/author/dr/" "$S/coming-soon/" "$S/rss/" "$S/sitemap.xml" "$S/tag/news/")"
check "B2 URL list = every URL of the four sitemaps + homepage, RSS and sitemap index (7)" "$([ "$(cat "$D/c10-old-urls.txt")" = "$expected" ]; echo $?)" "$(cat "$D/c10-old-urls.txt" | tr '\n' ' ')"
check "B3 ~/backup/old-urls.txt written for D2b" "$(cmp -s "$D/c10-old-urls.txt" "$T/home/backup/old-urls.txt"; echo $?)"
check "B4 original ghost backup zip preserved, unchanged, in the Ghost folder" "$(ls "$T"/gh/*.zip >/dev/null 2>&1 && [ "$(sha256sum "$T"/gh/*.zip | cut -d' ' -f1)" = "$zsum" ] && grep -q 'Original ghost backup zip kept' <<<"$out"; echo $?)"
check "B5 copy in the backup folder is identical to the original" "$(cmp -s "$T"/gh/*.zip "$D"/backup-from-v*.zip; echo $?)"
check "B6 SHA256SUMS verifies and covers the fetched sitemaps" "$(cd "$D" && sha256sum -c --quiet SHA256SUMS && grep -q c10-sitemap-tags.xml SHA256SUMS; echo $?)"
check "B7 backup folders are 0700; logs excluded from the content archive" "$([ "$(stat -c %a "$D")" = 700 ] && [ "$(stat -c %a "$T/home/backup")" = 700 ] && ! tar tzf "$D/c5-content.tgz" | grep -q logs; echo $?)"

for s in sitemap-posts sitemap-pages sitemap-tags sitemap-authors sitemap.xml; do
  out="$(FAIL_URL="$s" FAIL_CODE=404 backup)"; rc=$?
  check "B8 HTTP 404 for $s stops the script" "$([ $rc = 1 ] && grep -q "STOP: C10: .*$s.* returned HTTP 404" <<<"$out" && ! grep -q 'BACKUP OK' <<<"$out"; echo $?)" "$(tail -2 <<<"$out")"
done
out="$(FAIL_URL=sitemap-tags FAIL_CODE=503 backup)"; rc=$?
check "B9 HTTP 503 for a sitemap stops the script" "$([ $rc = 1 ] && grep -q 'returned HTTP 503' <<<"$out"; echo $?)"
out="$(FAIL_URL=sitemap-pages CURL_EXIT=6 backup)"; rc=$?
check "B10 a network failure (curl exit 6) stops the script" "$([ $rc = 1 ] && grep -q 'STOP: C10: the request for .*sitemap-pages.xml failed (curl exit 6)' <<<"$out"; echo $?)" "$(tail -2 <<<"$out")"
out="$(HTML_URL=sitemap-authors backup)"; rc=$?
check "B11 a 200 response that is not a sitemap stops the script" "$([ $rc = 1 ] && grep -q 'is not a sitemap' <<<"$out"; echo $?)"
cp "$T/fx/sitemap.xml" "$T/fx/idx.bak"; sed -i "s#</sitemapindex>#<sitemap><loc>$S/sitemap-extra.xml</loc></sitemap></sitemapindex>#" "$T/fx/sitemap.xml"
out="$(backup)"; rc=$?; cp "$T/fx/idx.bak" "$T/fx/sitemap.xml"
check "B12 an index listing an unexpected sitemap stops the script" "$([ $rc = 1 ] && grep -q 'does not list exactly the four' <<<"$out"; echo $?)"
check "B13 after every failed run the original zip is still in the Ghost folder" "$([ "$(sha256sum "$T"/gh/*.zip | cut -d' ' -f1)" = "$zsum" ]; echo $?)"
out="$(DUMP_WARN=1 backup)"; rc=$?
check "B14 a mysqldump warning stops the script" "$([ $rc = 1 ] && grep -q 'mysqldump reported errors or warnings' <<<"$out"; echo $?)"
rm -f "$T"/gh/*.zip; out="$(backup)"; rc=$?
check "B15 no ghost backup zip stops the script" "$([ $rc = 1 ] && grep -q 'run C3 (ghost backup) first' <<<"$out"; echo $?)"

echo "== phase-c-restore-test.sh"
newzip b; backup >/dev/null; D="$(bkdir)"
W="$T/win/himandme-backup"; mkdir -p "$W"; cp -r "$D" "$W/"; R="$W/$(basename "$D")"; mkdir "$R/admin"
echo '{"db":[{"data":{"posts":[1,2,3,4,5,6,7,8,9]}}]}' > "$R/admin/himandme.ghost.json"
tar xzf "$R/c5-content.tgz" -O content/settings/routes.yaml > "$R/admin/routes.yaml"
printf '301:\n  /old/: /new/\n302: {}\n' > "$R/admin/redirects.yaml"
(cd "$T/zipsrc" && zip -qr "$R/admin/source.zip" .)
restore() { ALLOW_NON_WSL=1 BACKUP_ROOT="$W" PATH="$T/bin:$PATH" timeout 60 bash "$RESTORE_SH" </dev/null 2>&1; }
rsum="$(sha256sum "$R/admin/redirects.yaml")"
out="$(restore)"; rc=$?
check "R1 restore test passes on a good copy" "$([ $rc = 0 ] && grep -q '^C8 RESTORE TEST PASSED' <<<"$out"; echo $?)" "$(tail -3 <<<"$out")"
check "R2 active theme compared with the server's" "$(grep -q 'C8 active theme matches the server: source' <<<"$out"; echo $?)"
check "R3 redirects format validated, file not changed" "$(grep -q 'format valid; file not changed' <<<"$out" && [ "$(sha256sum "$R/admin/redirects.yaml")" = "$rsum" ]; echo $?)"
cp "$R/c4-db-reference.txt" "$T/ref.bak"; sed -i 's/^active_theme\tsource/active_theme\tcasper/' "$R/c4-db-reference.txt"
(cd "$R" && sha256sum -- $(cut -d' ' -f3 SHA256SUMS) > SHA256SUMS.new && mv SHA256SUMS.new SHA256SUMS)
out="$(restore)"; rc=$?
check "R4 restored active theme different from the server's stops the test" "$([ $rc = 1 ] && grep -q "differs from the server's 'casper'" <<<"$out"; echo $?)" "$(tail -1 <<<"$out")"
cp "$T/ref.bak" "$R/c4-db-reference.txt"; (cd "$R" && sha256sum -- $(cut -d' ' -f3 SHA256SUMS) > SHA256SUMS.new && mv SHA256SUMS.new SHA256SUMS)
echo '{"db":[{"data":{"posts":[1,2,3]}}]}' > "$R/admin/himandme.ghost.json"
out="$(restore)"; rc=$?
check "R5 export count discrepancy is an explicit review condition (exit 2, no PASSED)" "$([ $rc = 2 ] && grep -q 'REVIEW REQUIRED' <<<"$out" && ! grep -q 'TEST PASSED' <<<"$out"; echo $?)" "$(tail -3 <<<"$out")"
echo '{"db":[{"data":{"posts":[1,2,3,4,5,6,7,8,9]}}]}' > "$R/admin/himandme.ghost.json"
printf '404:\n  /a/: /b/\n' > "$R/admin/redirects.yaml"; out="$(restore)"; rc=$?
check "R6 invalid YAML redirects stop the test" "$([ $rc = 1 ] && grep -q 'not in a valid Ghost redirects format' <<<"$out"; echo $?)"
rm "$R/admin/redirects.yaml"; echo '[{"from":"/a/","to":"/b/","permanent":true}]' > "$R/admin/redirects.json"; out="$(restore)"; rc=$?
check "R7 valid JSON redirects pass" "$([ $rc = 0 ] && grep -q 'JSON, 1 rule' <<<"$out"; echo $?)"
echo '{"from":"/a/"}' > "$R/admin/redirects.json"; out="$(restore)"; rc=$?
check "R8 invalid JSON redirects stop the test" "$([ $rc = 1 ]; echo $?)"
rm "$R/admin/redirects.json"; printf '301:\n  /old/: /new/\n' > "$R/admin/redirects.yaml"
echo tampered >> "$R/c10-old-urls.txt"; out="$(restore)"; rc=$?
check "R9 a changed copy stops the test (C7)" "$([ $rc = 1 ] && grep -q 'checksum mismatch' <<<"$out"; echo $?)"
(cd "$R" && head -n -1 c10-old-urls.txt > x && mv x c10-old-urls.txt)
echo changed > "$R/admin/routes.yaml"; out="$(restore)"; rc=$?
check "R10 routes.yaml different from the server copy stops the test" "$([ $rc = 1 ] && grep -q 'differs from content/settings/routes.yaml' <<<"$out"; echo $?)"
out="$(BACKUP_ROOT="$W" timeout 20 bash "$RESTORE_SH" </dev/null 2>&1)"; rc=$?
check "R11 refuses to run outside WSL" "$([ $rc = 1 ] && grep -q 'never run the restore test on the production server' <<<"$out"; echo $?)"

echo; echo "$pass passed, $failn failed"
[ "$failn" = 0 ]
