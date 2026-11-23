#!/usr/bin/env bash
# Stage 7 Phase C (C3 collect, C4, C5, C10 + reference data): production backup on the Him & Me VPS.
# Owner runs it as the `ubuntu` user AFTER `ghost backup` (C3). See docs/stage-7/PHASE-C-RUNSHEET.md.
#
# [WRITES BACKUP FILES] It only creates a NEW folder ~/backup/pre-launch-YYYYMMDD-HHMMSS and writes into it.
# It does not change Ghost, MySQL, Nginx, settings or content (the database is only read: mysqldump and
# SELECT queries). No password is typed or printed: MySQL root uses auth_socket (I30).
# It prints "PHASE C SERVER BACKUP OK" only when every check passes; otherwise "STOP: …".
set -u -o pipefail   # a failure anywhere in a pipeline fails that pipeline
umask 077
fail() { echo "STOP: $1"; echo "STOP: Phase C server backup FAILED. Do not continue; send this output."; exit 1; }

GHOST_DIR="${GHOST_DIR:-/var/www/himandme}"   # overridable only for a dry run of this script
ETC="${ETC:-/etc}"
DB=himandme
TS="$(date +%Y%m%d-%H%M%S)"
BK="$HOME/backup/pre-launch-$TS"

[ -d "$GHOST_DIR/content" ] || fail "$GHOST_DIR/content not found"
[ ! -e "$BK" ] || fail "$BK already exists"
mkdir -p "$BK" || fail "cannot create $BK"
chmod 700 "$HOME/backup" "$BK" || fail "cannot set permissions on the backup folder"
cd "$BK" || fail "cannot enter $BK"
echo "Backup folder: $BK"

# C3 (collect): the zip that `ghost backup` wrote into the Ghost folder in the previous step.
Z="$(ls -t "$GHOST_DIR"/backup-from-v*.zip 2>/dev/null | head -n 1)"
[ -n "$Z" ] || fail "no backup-from-v*.zip in $GHOST_DIR: run C3 (ghost backup) first"
[ -n "$(find "$Z" -mmin -180)" ] || fail "the newest ghost backup zip is older than 3 hours: $Z (run C3 again)"
cp -p "$Z" "$BK/" || fail "cannot copy $Z into $BK"   # the original stays in the Ghost folder (never deleted)
cmp -s "$Z" "$BK/$(basename "$Z")" || fail "the copied ghost backup zip differs from the original"
ZB="$BK/$(basename "$Z")"
unzip -l "$ZB" > c3-ghost-backup-contents.txt 2>&1 || fail "the ghost backup zip cannot be read"
for want in '\.json' 'images/' 'themes/' 'settings/'; do
  grep -q "$want" c3-ghost-backup-contents.txt || fail "the ghost backup zip has no entry matching $want"
done
echo "C3 ghost backup collected: $(basename "$ZB")"

# C4: MySQL dump (approved form, plan §8.2 and the monthly runbook).
sudo mysqldump --single-transaction --no-tablespaces --default-character-set=utf8mb4 "$DB" > c4-ghost-himandme.sql 2> c4-ghost-himandme.sql.err
rc=$?
[ "$rc" -eq 0 ] || fail "mysqldump exited with status $rc (see $BK/c4-ghost-himandme.sql.err)"
[ -s c4-ghost-himandme.sql ] || fail "the dump is empty"
[ ! -s c4-ghost-himandme.sql.err ] || fail "mysqldump reported errors or warnings (see $BK/c4-ghost-himandme.sql.err)"
case "$(tail -n 1 c4-ghost-himandme.sql)" in *"Dump completed"*) ;; *) fail "the dump does not end with 'Dump completed'";; esac
grep -q "CREATE TABLE \`posts\`" c4-ghost-himandme.sql || fail "the dump has no posts table"
echo "C4 MySQL dump OK"

# Reference values for the C8 restore test and the C6 cross-check (read-only queries; values, not credentials).
sudo mysql -N -B "$DB" > c4-db-reference.txt 2>&1 <<'SQL' || fail "the reference queries failed (see c4-db-reference.txt)"
SELECT 'posts_rows', COUNT(*) FROM posts;
SELECT 'posts_by_type_status', type, status, COUNT(*) FROM posts GROUP BY type, status;
SELECT 'tables', COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();
SELECT 'charset_collation', DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = DATABASE();
SELECT 'active_theme', value FROM settings WHERE `key` = 'active_theme';
SELECT 'is_private', value FROM settings WHERE `key` = 'is_private';
SELECT 'llms_enabled', value FROM settings WHERE `key` = 'llms_enabled';
SQL
grep -q '^posts_rows' c4-db-reference.txt || fail "no post count in c4-db-reference.txt"

# C5: content folder (logs excluded: not needed to restore, and they change while being read) and Nginx configuration.
sudo tar czf c5-content.tgz --exclude=content/logs -C "$GHOST_DIR" content 2> c5-content.err || fail "tar of content failed (see c5-content.err)"
# Nginx: configuration files only, never private-key material (see the rules below). Only file NAMES are ever printed.
#  - allowlist of configuration paths; anything else under /etc/nginx is skipped and listed;
#  - a file is skipped if it is not plain text, has a key/certificate-style name, contains a PEM private-key block,
#    or is (by real path) a file named by ssl_certificate_key / ssl_password_file in any configuration;
#  - symlinks are stored as links only (tar never follows them), so a link to a key copies no key material;
#  - after archiving, the whole archive content is scanned again; any private-key block stops the script.
NG="$ETC/nginx"
KEYRE='-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----'
# Directives anywhere on a line (also after "server {"); a commented-out one only adds a reference (safe side).
sudo grep -rhoE '(^|[;{}[:space:]])(ssl_certificate_key|ssl_password_file)[[:space:]]+[^;#{}]+' "$NG" 2>/dev/null \
  | sed -E 's/^[;{}[:space:]]*(ssl_certificate_key|ssl_password_file)[[:space:]]+//; s/[[:space:]]+$//; s/^["'"'"']//; s/["'"'"']$//' \
  | LC_ALL=C sort -u > c5-nginx-key-references.txt
: > c5-nginx-include.txt; : > c5-nginx-skipped.txt
while IFS= read -r rel; do
  f="$NG/$rel"
  if [ -L "$f" ]; then echo "nginx/$rel" >> c5-nginx-include.txt; continue; fi   # stored as a link, never followed
  why=""
  case "$rel" in
    nginx.conf|mime.types|fastcgi.conf|fastcgi_params|proxy_params|scgi_params|uwsgi_params|koi-utf|koi-win|win-utf) ;;
    sites-available/*|sites-enabled/*|snippets/*|conf.d/*|modules-available/*|modules-enabled/*) ;;
    *) why="not a configuration path";;
  esac
  [ -z "$why" ] && case "$rel" in *.key|*.pem|*.crt|*.cer|*.der|*.p12|*.pfx|*.jks|*.csr|*privkey*|*private*|*secret*) why="key/certificate-style name";; esac
  [ -z "$why" ] && { sudo grep -Iq . "$f" 2>/dev/null || [ ! -s "$f" ]; } || why="${why:-not plain text or unreadable}"
  [ -z "$why" ] && sudo grep -qE -- "$KEYRE" "$f" 2>/dev/null && why="contains a private-key block"
  if [ -z "$why" ]; then
    real="$(readlink -f -- "$f")"
    while IFS= read -r ref; do
      [ -n "$ref" ] || continue
      case "$ref" in /*) ;; *) ref="$NG/$ref";; esac   # relative paths are resolved against the Nginx prefix
      [ "$(readlink -m -- "$ref")" = "$real" ] && why="named by ssl_certificate_key/ssl_password_file"
    done < c5-nginx-key-references.txt
  fi
  if [ -n "$why" ]; then echo "nginx/$rel  ($why)" >> c5-nginx-skipped.txt; else echo "nginx/$rel" >> c5-nginx-include.txt; fi
done < <(sudo find "$NG" -mindepth 1 \( -type f -o -type l \) -printf '%P\n' | LC_ALL=C sort)
[ -s c5-nginx-include.txt ] || fail "no Nginx configuration files selected"
sudo tar czf c5-nginx-etc.tgz -C "$ETC" --no-recursion --verbatim-files-from -T c5-nginx-include.txt 2> c5-nginx.err || fail "tar of the Nginx configuration failed (see c5-nginx.err)"
sudo chown "$(id -un):$(id -gn)" c5-content.tgz c5-nginx-etc.tgz || fail "cannot take ownership of the archives"
chmod 600 c5-content.tgz c5-nginx-etc.tgz
tar tzf c5-content.tgz > c5-content-list.txt || fail "c5-content.tgz cannot be read"
# content/settings holds routes.yaml (and similar) only once a routes file has been uploaded; with Ghost's built-in
# default routes it is empty. So: every file that IS on disk there must be in the archive, and an empty folder is noted.
sudo find "$GHOST_DIR/content/settings" -mindepth 1 -type f -printf 'content/settings/%P\n' | LC_ALL=C sort > c5-settings-on-disk.txt \
  || fail "cannot list $GHOST_DIR/content/settings"
while IFS= read -r f; do grep -qxF -- "$f" c5-content-list.txt || fail "$f is on the server but missing from c5-content.tgz"; done < c5-settings-on-disk.txt
if [ -s c5-settings-on-disk.txt ]; then echo "C5 content/settings: $(wc -l < c5-settings-on-disk.txt) file(s), all archived"
else
  echo "C5 note: content/settings is empty on the server (no routes file was ever uploaded; Ghost uses its built-in default routes)."
  echo "        The routes as served are in the C2 Admin export (routes.yaml)$(grep -q 'settings/routes.yaml' c3-ghost-backup-contents.txt && echo ' and in the ghost backup zip')."
fi
grep -q '^content/themes/' c5-content-list.txt || fail "content/themes missing from c5-content.tgz"
tar tzf c5-nginx-etc.tgz > c5-nginx-list.txt || fail "c5-nginx-etc.tgz cannot be read"
grep -q '^nginx/sites-available/himandme' c5-nginx-list.txt || fail "the himandme site configuration is missing from c5-nginx-etc.tgz"
tar tvzf c5-nginx-etc.tgz > c5-nginx-types.txt || fail "c5-nginx-etc.tgz cannot be listed"
[ "$(cut -c1 c5-nginx-types.txt | sort -u | tr -d '\n')" = "$(cut -c1 c5-nginx-types.txt | sort -u | grep -E '^[-l]$' | tr -d '\n')" ] \
  || fail "c5-nginx-etc.tgz holds an entry that is neither a file nor a symlink"
# Final guard: extract into a private scratch folder (symlinks stay links; grep -r does not follow them) and scan everything.
SCAN="$(mktemp -d "$BK/.nginx-scan.XXXXXX")" || fail "cannot create a scratch folder"
tar xzf c5-nginx-etc.tgz -C "$SCAN" || { rm -rf "$SCAN"; fail "c5-nginx-etc.tgz cannot be extracted for the key scan"; }
hits="$(grep -rlaE -- "$KEYRE" "$SCAN" | sed "s#^$SCAN/##")"; grc=$?
rm -rf "$SCAN"
[ "$grc" -le 1 ] || fail "the private-key scan of c5-nginx-etc.tgz failed"
[ -z "$hits" ] || fail "private-key material found inside c5-nginx-etc.tgz: $(echo $hits)"
while IFS= read -r line; do
  case "$line" in l*) ;; *) fail "a key-style name is archived as file content: ${line##* }";; esac
done < <(grep -iE '\.(key|pem|p12|pfx|der)( |$)|privkey' c5-nginx-types.txt)
if [ -s c5-nginx-skipped.txt ]; then echo "C5 Nginx: $(wc -l < c5-nginx-skipped.txt) file(s) NOT archived (names only, for review):"; sed 's/^/  /' c5-nginx-skipped.txt; fi
echo "C5 Nginx: $(grep -c '^l' < <(tar tvzf c5-nginx-etc.tgz)) symlink(s) stored as links only; key references: $(wc -l < c5-nginx-key-references.txt) path(s) (paths only, no key material)"
echo "C5 content and Nginx archives OK ($(wc -l < c5-content-list.txt) and $(wc -l < c5-nginx-list.txt) entries)"

# C10: every currently public URL (old site, still public), plan §8.2.
# Every sitemap request must succeed (curl exit 0, HTTP 200, a sitemap body), and the index must list exactly
# the four sub-sitemaps, so no URL can be missed silently. The fetched sitemaps are kept as evidence.
SITE="${SITE:-https://himandme.my}"
fetch_sitemap() {  # $1 = name, $2 = URL
  local code
  code="$(curl -sS --max-time 30 -o "c10-$1.xml" -w '%{http_code}' "$2")" || fail "C10: the request for $2 failed (curl exit $?)"
  [ "$code" = 200 ] || fail "C10: $2 returned HTTP $code"
  grep -qE '<(urlset|sitemapindex)[ >]' "c10-$1.xml" || fail "C10: $2 is not a sitemap"
}
fetch_sitemap sitemap-index "$SITE/sitemap.xml"
idx="$(grep -o '<loc>[^<]*' c10-sitemap-index.xml | sed 's/<loc>//' | sort)" || fail "C10: the sitemap index lists no sitemaps"
want="$(for s in authors pages posts tags; do echo "$SITE/sitemap-$s.xml"; done)"
[ "$idx" = "$want" ] || fail "C10: the sitemap index does not list exactly the four expected sitemaps: $(echo $idx)"
for s in posts pages tags authors; do fetch_sitemap "sitemap-$s" "$SITE/sitemap-$s.xml"; done
for s in posts pages tags authors; do
  echo "C10 sitemap-$s.xml: $(grep -o '<loc>' "c10-sitemap-$s.xml" | wc -l) URLs"
done
{ cat c10-sitemap-posts.xml c10-sitemap-pages.xml c10-sitemap-tags.xml c10-sitemap-authors.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//'
  printf '%s\n' "$SITE/" "$SITE/rss/" "$SITE/sitemap.xml"; } | sort -u > c10-old-urls.txt || fail "C10: cannot build the URL list"
[ "$(wc -l < c10-old-urls.txt)" -ge 4 ] || fail "c10-old-urls.txt has fewer than 4 URLs"
for u in "$SITE/" "$SITE/rss/" "$SITE/sitemap.xml"; do grep -qxF "$u" c10-old-urls.txt || fail "C10: $u missing from the list"; done
cp c10-old-urls.txt "$HOME/backup/old-urls.txt" || fail "cannot write ~/backup/old-urls.txt (used by D2b)"
echo "C10 public URL list: $(wc -l < c10-old-urls.txt) URLs"

# Versions (no secrets).
{ echo "date: $(date -Is)"; echo "host: $(hostname)"; echo "kernel: $(uname -r)"
  echo "mysql: $(mysql --version)"; echo "node: $(node -v 2>&1)"
  ( cd "$GHOST_DIR" && ghost version 2>&1 ) | sed 's/^/ghost: /'; } > versions.txt

# Checksums of everything in the folder.
sha256sum -- * > SHA256SUMS || fail "cannot write SHA256SUMS"
sha256sum -c --quiet SHA256SUMS || fail "checksum self-check failed"

echo
echo "Files:"; ls -la "$BK"
echo
echo "Reference values (needed for C8):"; cat c4-db-reference.txt
echo
echo "C10 URLs:"; cat c10-old-urls.txt
echo
[ -f "$Z" ] || fail "the original ghost backup zip is missing from $GHOST_DIR"
echo "Original ghost backup zip kept: $Z"
echo "PHASE C SERVER BACKUP OK: $BK"
echo
echo "Next (C7), in PowerShell on your computer:"
echo "  mkdir \$env:USERPROFILE\\himandme-backup"
echo "  scp -r $(id -un)@himandme.my:backup/pre-launch-$TS \$env:USERPROFILE\\himandme-backup\\"
