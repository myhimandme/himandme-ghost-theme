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
mkdir -p "$T/etc/nginx/sites-enabled" "$T/etc/nginx/snippets" "$T/etc/letsencrypt/live/himandme.my"
printf -- '-----BEGIN PRIVATE KEY-----\nREALKEYMATERIAL\n-----END PRIVATE KEY-----\n' > "$T/etc/letsencrypt/live/himandme.my/privkey.pem"
printf 'server {\n  ssl_certificate %s/etc/letsencrypt/live/himandme.my/fullchain.pem;\n  ssl_certificate_key %s/etc/letsencrypt/live/himandme.my/privkey.pem;\n}\n' "$T" "$T" > "$T/etc/nginx/sites-available/himandme.conf"
ln -s ../sites-available/himandme.conf "$T/etc/nginx/sites-enabled/himandme.conf"
echo "ssl_protocols TLSv1.2 TLSv1.3;" > "$T/etc/nginx/snippets/ssl-params.conf"; echo "user www-data;" > "$T/etc/nginx/nginx.conf"
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
if [ -n "${BYPASS_KEYCHECK:-}" ] && [ "$1" = grep ] && [ "$2" = -qE ]; then exit 1; fi
exec "$@"
X
cat > "$T/bin/mysqldump" <<'X'
#!/bin/bash
[ -n "${DUMP_WARN:-}" ] && echo "Warning: something" >&2
printf -- '-- MySQL dump\nCREATE TABLE `posts` (id int);\n-- Dump completed on 2026-11-23\n'
X
mkdir -p "$T/mysql"
cat > "$T/bin/mysql" <<X
#!/bin/bash
# Stateful stand-in: databases are files in \$DBS; every action is logged.
DBS="$T/mysql"; LOG="$T/mysql.log"
args="\$*"
case "\$args" in
  --version) echo "mysql  Ver 8.0.46";;
  *SCHEMA_NAME*ghost_restore_test*) [ -e "\$DBS/ghost_restore_test" ] && echo ghost_restore_test; true;;
  *"CREATE DATABASE"*) echo "CREATE" >> "\$LOG"; [ -e "\$DBS/ghost_restore_test" ] && { echo "ERROR 1007: database exists" >&2; exit 1; }; echo created > "\$DBS/ghost_restore_test";;
  *"DROP DATABASE"*) echo "DROP" >> "\$LOG"; rm -f "\$DBS/ghost_restore_test";;
  *ghost_restore_test*.posts*) echo "\${POSTS:-9}";;
  *information_schema.tables*) echo 103;;
  *ghost_restore_test*.settings*) echo source;;
  "-N -B himandme") cat >/dev/null; printf 'posts_rows\t9\ntables\t103\ncharset_collation\tutf8mb4\tutf8mb4_0900_ai_ci\nactive_theme\t%s\n' "\${REF_THEME:-source}";;
  ghost_restore_test) echo "RESTORE" >> "\$LOG"; cat >/dev/null; [ -n "\${RESTORE_FAIL:-}" ] && { echo "ERROR 1064 at line 2" >&2; exit 1; }; echo restored >> "\$DBS/ghost_restore_test";;
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

echo "== Nginx private-key protection (phase-c-backup.sh)"
NG="$T/etc/nginx"; mkdir -p "$NG/conf.d" "$NG/ssl"
printf -- '-----BEGIN PRIVATE KEY-----\nKEYA\n-----END PRIVATE KEY-----\n' > "$NG/snippets/tls.conf"                     # key with a config-style name
printf -- '-----BEGIN RSA PRIVATE KEY-----\nKEYB\n-----END RSA PRIVATE KEY-----\n' > "$NG/sites-available/himandme-cert"  # key with no extension
printf -- '-----BEGIN EC PRIVATE KEY-----\nKEYC\n-----END EC PRIVATE KEY-----\n-----BEGIN ENCRYPTED PRIVATE KEY-----\nKEYD\n-----END ENCRYPTED PRIVATE KEY-----\n' > "$NG/conf.d/ec.conf"
printf -- '-----BEGIN OPENSSH PRIVATE KEY-----\nKEYE\n-----END OPENSSH PRIVATE KEY-----\n' > "$NG/snippets/deploy"
head -c 600 /dev/urandom > "$NG/snippets/server.bin"                                                                   # binary (DER-like) key
echo "MIIEvQIBADANBgkqhkiG9w0BAQEFAASC" > "$NG/snippets/opaque-material"                                               # no PEM header, but referenced
echo "server { ssl_certificate_key snippets/opaque-material; }" > "$NG/sites-available/extra.conf"
echo "KEYF" > "$NG/ssl/server.key"                                                                                       # outside the allowlist
ln -s "$T/etc/letsencrypt/live/himandme.my/privkey.pem" "$NG/conf.d/le-key.conf"                                        # symlink to a key, config-style name
ln -s "$T/etc/letsencrypt/live/himandme.my" "$NG/certs"                                                                   # symlink to a key directory
newzip k; out="$(backup)"; rc=$?; D="$(bkdir)"
check "K1 backup passes with hostile key files present (they are excluded, not fatal)" "$([ $rc = 0 ] && grep -q '^PHASE C SERVER BACKUP OK' <<<"$out"; echo $?)" "$(grep STOP <<<"$out")"
X="$T/extract"; rm -rf "$X"; mkdir -p "$X"; tar xzf "$D/c5-nginx-etc.tgz" -C "$X"
check "K2 no private-key material anywhere in the Nginx archive (symlinks not followed)" "$(! grep -rlaE 'PRIVATE KEY|KEY[A-F]|REALKEYMATERIAL|MIIEvQ' "$X" >/dev/null; echo $?)" "$(grep -rlaE 'PRIVATE KEY|KEY[A-F]|REALKEYMATERIAL|MIIEvQ' "$X")"
miss=""; for f in snippets/tls.conf sites-available/himandme-cert conf.d/ec.conf snippets/deploy snippets/server.bin snippets/opaque-material ssl/server.key; do
  grep -qx "nginx/$f" "$D/c5-nginx-list.txt" && miss="$miss $f(archived)"; grep -q "^nginx/$f " "$D/c5-nginx-skipped.txt" || miss="$miss $f(not-listed-as-skipped)"; done
check "K3 non-standard key files are skipped and listed by name: config-style name, no extension, EC/encrypted/OpenSSH blocks, binary, referenced by a relative ssl_certificate_key, outside the allowlist" "$([ -z "$miss" ]; echo $?)" "$miss"
check "K4 skip reasons recorded" "$(grep -q 'snippets/tls.conf  (contains a private-key block)' "$D/c5-nginx-skipped.txt" && grep -q 'snippets/server.bin  (not plain text' "$D/c5-nginx-skipped.txt" && grep -q 'snippets/opaque-material  (named by ssl_certificate_key' "$D/c5-nginx-skipped.txt"; echo $?)" "$(cat "$D/c5-nginx-skipped.txt")"
check "K5 symlinks to a key and to a key directory are stored as links only" "$(grep -q '^l.* nginx/conf.d/le-key.conf -> ' "$D/c5-nginx-types.txt" && grep -q '^l.* nginx/certs -> ' "$D/c5-nginx-types.txt" && [ -L "$X/nginx/conf.d/le-key.conf" ] && [ -L "$X/nginx/certs" ] && [ -z "$(find "$X" -type f -name 'privkey*')" ] && [ -z "$(find "$X" -type d -path '*certs*')" ]; echo $?)"
check "K6 the real configuration is archived (nginx.conf, site config, enabled link, snippet)" "$(for f in nginx.conf sites-available/himandme.conf sites-enabled/himandme.conf snippets/ssl-params.conf sites-available/extra.conf; do grep -qx "nginx/$f" "$D/c5-nginx-list.txt" || exit 1; done; echo 0)"
check "K7 key references recorded as paths only" "$(grep -q 'privkey.pem$' "$D/c5-nginx-key-references.txt" && grep -qx 'snippets/opaque-material' "$D/c5-nginx-key-references.txt" && ! grep -q BEGIN "$D/c5-nginx-key-references.txt"; echo $?)"
check "K8 no key material printed in the script output" "$(! grep -qE 'BEGIN|KEY[A-F]|REALKEYMATERIAL|MIIEvQ' <<<"$out"; echo $?)"
check "K9 no scratch folder left behind" "$(! ls -a "$D" | grep -q nginx-scan; echo $?)"
out="$(BYPASS_KEYCHECK=1 backup)"; rc=$?
check "K10 final guard: if a key slipped past the per-file checks, the archive scan stops the script" "$([ $rc = 1 ] && grep -q 'private-key material found inside c5-nginx-etc.tgz' <<<"$out" && ! grep -qE 'KEY[A-F]|REALKEYMATERIAL' <<<"$out"; echo $?)" "$(tail -2 <<<"$out")"
rm -rf "$NG/conf.d" "$NG/ssl" "$NG/certs" "$NG/snippets/tls.conf" "$NG/sites-available/himandme-cert" "$NG/snippets/deploy" "$NG/snippets/server.bin" "$NG/snippets/opaque-material" "$NG/sites-available/extra.conf"

echo "== restore database collision protection (phase-c-restore-test.sh)"
D2="$(ls -d "$W"/pre-launch-*)"; rm -f "$T/mysql.log" "$T/mysql/ghost_restore_test"
printf '301:\n  /old/: /new/\n' > "$D2/admin/redirects.yaml"; tar xzf "$D2/c5-content.tgz" -O content/settings/routes.yaml > "$D2/admin/routes.yaml"
out="$(restore)"; rc=$?
check "D1 clean run: creates, restores and drops its own test database" "$([ $rc = 0 ] && [ "$(tr '\n' ' ' < "$T/mysql.log")" = "CREATE RESTORE DROP " ] && [ ! -e "$T/mysql/ghost_restore_test" ] && grep -q 'created by this run) dropped' <<<"$out"; echo $?)" "$(tail -3 <<<"$out"; cat "$T/mysql.log" 2>/dev/null)"
rm -f "$T/mysql.log"; echo "precious existing data" > "$T/mysql/ghost_restore_test"; before="$(sha256sum "$T/mysql/ghost_restore_test")"
out="$(restore)"; rc=$?
check "D2 an existing ghost_restore_test stops the script with STOP" "$([ $rc = 1 ] && grep -q 'STOP: a database named ghost_restore_test already exists; it was left untouched' <<<"$out"; echo $?)" "$(tail -2 <<<"$out")"
check "D3 the existing database is preserved: not dropped, not recreated, not restored into" "$([ "$(sha256sum "$T/mysql/ghost_restore_test")" = "$before" ] && [ ! -s "$T/mysql.log" ]; echo $?)" "$(cat "$T/mysql.log" 2>/dev/null)"
rm -f "$T/mysql/ghost_restore_test" "$T/mysql.log"
out="$(RESTORE_FAIL=1 restore)"; rc=$?
check "D4 restore failure: STOP, and the database created by this run is dropped" "$([ $rc = 1 ] && grep -q 'the restore reported errors' <<<"$out" && [ ! -e "$T/mysql/ghost_restore_test" ] && [ "$(tr '\n' ' ' < "$T/mysql.log")" = "CREATE RESTORE DROP " ]; echo $?)" "$(tail -3 <<<"$out")"
rm -f "$T/mysql.log"
out="$(POSTS=8 restore)"; rc=$?
check "D5 a failed check after the restore also drops the database created by this run" "$([ $rc = 1 ] && grep -q 'post count differs' <<<"$out" && [ ! -e "$T/mysql/ghost_restore_test" ]; echo $?)" "$(tail -2 <<<"$out")"

echo "== empty content/settings (server uses Ghost's default routes; found in production Phase C run 1)"
mv "$T/gh/content/settings/routes.yaml" "$T/routes.disk.bak"
echo "routes: {}  # ghost default" > "$T/zipsrc/settings/routes.yaml"
setup_restore() {  # fresh copy of the newest backup in $W, admin/ filled; $1 = routes content for admin/routes.yaml
  rm -rf "$W"/pre-launch-*; cp -r "$(bkdir)" "$W/"; R="$(ls -d "$W"/pre-launch-*)"; mkdir "$R/admin"
  echo '{"db":[{"data":{"posts":[1,2,3,4,5,6,7,8,9]}}]}' > "$R/admin/export.json"; printf '%s\n' "$1" > "$R/admin/routes.yaml"
  printf '301:\n  /old/: /new/\n' > "$R/admin/redirects.yaml"; (cd "$T/zipsrc" && zip -qr "$R/admin/source.zip" .); rm -f "$T/mysql/ghost_restore_test"; }
newzip e1; out="$(backup)"; rc=$?
check "E1 empty content/settings: backup passes and says so (routes in the export and the ghost backup zip)" "$([ $rc = 0 ] && grep -q 'C5 note: content/settings is empty' <<<"$out" && grep -q 'and in the ghost backup zip' <<<"$out" && [ ! -s "$(bkdir)/c5-settings-on-disk.txt" ]; echo $?)" "$(grep -E 'STOP|C5' <<<"$out")"
setup_restore "routes: {}  # ghost default"; out="$(restore)"; rc=$?
check "E2 restore test compares the exported routes.yaml with the ghost backup copy and passes" "$([ $rc = 0 ] && grep -q 'matches the ghost backup copy' <<<"$out" && grep -q '^C8 RESTORE TEST PASSED' <<<"$out"; echo $?)" "$(tail -3 <<<"$out")"
setup_restore "routes: changed"; out="$(restore)"; rc=$?
check "E3 an exported routes.yaml that differs from the ghost backup copy stops the test" "$([ $rc = 1 ] && grep -q 'differs from .*settings/routes.yaml in the ghost backup zip' <<<"$out"; echo $?)" "$(tail -2 <<<"$out")"
rm -f "$T/zipsrc/settings/routes.yaml"; newzip e4; backup >/dev/null; setup_restore "routes: {}"; out="$(restore)"; rc=$?
check "E4 no server-side routes copy anywhere: REVIEW REQUIRED (exit 2), not PASSED" "$([ $rc = 2 ] && grep -q 'REVIEW REQUIRED: no server-side routes.yaml' <<<"$out" && ! grep -q 'TEST PASSED' <<<"$out"; echo $?)" "$(tail -3 <<<"$out")"
mv "$T/routes.disk.bak" "$T/gh/content/settings/routes.yaml"; echo "extra: 1" > "$T/gh/content/settings/other.yaml"; newzip e5; out="$(backup)"; rc=$?
check "E5 files present in content/settings are all required in the archive" "$([ $rc = 0 ] && grep -q 'C5 content/settings: 2 file(s), all archived' <<<"$out"; echo $?)" "$(grep -E 'STOP|C5' <<<"$out")"
rm -f "$T/gh/content/settings/other.yaml"

echo; echo "$pass passed, $failn failed"
[ "$failn" = 0 ]
