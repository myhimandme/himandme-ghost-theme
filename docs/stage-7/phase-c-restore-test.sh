#!/usr/bin/env bash
# Stage 7 Phase C: C7 integrity check + C8 restore test + C2/C6 cross-checks. NEVER run on production.
# Runs in a disposable Ubuntu on the owner's computer (WSL) with MySQL 8.0. See docs/stage-7/PHASE-C-RUNSHEET.md.
# It only reads the copied backup folder. The test database ghost_restore_test is created by this run and dropped again,
# also on failure. If a database with that name already exists, it stops without touching it.
# Prints "C8 RESTORE TEST PASSED" only when every check passes; otherwise "STOP: …".
set -u -o pipefail
REVIEW=()   # conditions the owner must review; they prevent the PASSED line
fail() { echo "STOP: $1"; exit 1; }
[ -f /proc/sys/fs/binfmt_misc/WSLInterop ] || [ -n "${WSL_DISTRO_NAME:-}" ] || [ "${ALLOW_NON_WSL:-}" = 1 ] \
  || fail "this does not look like WSL; never run the restore test on the production server"
[ "$(hostname)" != "himandme" ] || fail "hostname looks like the production server"

if [ -z "${BACKUP_ROOT:-}" ]; then
  WINHOME="$(powershell.exe -NoProfile -Command '$env:USERPROFILE' 2>/dev/null | tr -d '\r')"
  BACKUP_ROOT="$(wslpath "$WINHOME")/himandme-backup"
fi
set -- "$BACKUP_ROOT"/pre-launch-*
[ "$#" -eq 1 ] && [ -d "$1" ] || fail "expected exactly one pre-launch-* folder in $BACKUP_ROOT (found $#)"
cd "$1" || fail "cannot enter $1"
echo "Backup folder: $PWD"

# C7: the copies are complete and unchanged.
sha256sum -c --quiet SHA256SUMS || fail "checksum mismatch: the copy is incomplete or changed"
echo "C7 copies verified: $(wc -l < SHA256SUMS) files match the server checksums"

REF=c4-db-reference.txt
want_posts="$(awk '$1=="posts_rows"{print $2}' "$REF")"
want_tables="$(awk '$1=="tables"{print $2}' "$REF")"
collation="$(awk '$1=="charset_collation"{print $3}' "$REF")"
want_theme="$(awk '$1=="active_theme"{print $2}' "$REF")"
[ -n "$want_posts" ] && [ -n "$want_tables" ] && [ -n "$collation" ] && [ -n "$want_theme" ] || fail "reference values missing in $REF"

# C8: restore the dump into a disposable database, count, drop.
TESTDB=ghost_restore_test
CREATED_DB=0   # 1 only after THIS run created the test database; only then may it be dropped
cleanup_db() {
  if [ "$CREATED_DB" = 1 ]; then
    if sudo mysql -e "DROP DATABASE \`$TESTDB\`;"; then CREATED_DB=0; echo "C8 cleanup: test database $TESTDB (created by this run) dropped"
    else echo "STOP: could not drop $TESTDB created by this run; drop it by hand in WSL"; fi
  fi
}
trap cleanup_db EXIT

# Collision protection: never drop, overwrite or modify a database this run did not create.
existing="$(sudo mysql -N -B -e "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='$TESTDB';")" \
  || fail "cannot query MySQL (is it running? sudo service mysql start)"
[ -z "$existing" ] || fail "a database named $TESTDB already exists; it was left untouched. Inspect it and remove it yourself only if it is disposable, then run this test again"
sudo mysql -e "CREATE DATABASE \`$TESTDB\` CHARACTER SET utf8mb4 COLLATE $collation;" \
  || fail "cannot create $TESTDB (it may have appeared meanwhile; nothing was dropped)"
CREATED_DB=1
sudo mysql "$TESTDB" < c4-ghost-himandme.sql 2> c8-restore.err; rc=$?
[ "$rc" -eq 0 ] && [ ! -s c8-restore.err ] || { cat c8-restore.err; fail "the restore reported errors"; }
got_posts="$(sudo mysql -N -B -e "SELECT COUNT(*) FROM \`$TESTDB\`.posts;")" || fail "cannot count restored posts"
got_tables="$(sudo mysql -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TESTDB';")" || fail "cannot count restored tables"
got_theme="$(sudo mysql -N -B -e "SELECT value FROM \`$TESTDB\`.settings WHERE \`key\`='active_theme';")" || fail "cannot read the restored active theme"
cleanup_db
[ "$CREATED_DB" = 0 ] || fail "cannot drop $TESTDB"
echo "C8 restored: posts $got_posts (server $want_posts), tables $got_tables (server $want_tables), active theme $got_theme; test database dropped"
[ "$got_posts" = "$want_posts" ] || fail "post count differs from the server"
[ "$got_tables" = "$want_tables" ] || fail "table count differs from the server"
[ "$got_theme" = "$want_theme" ] || fail "restored active theme '$got_theme' differs from the server's '$want_theme'"
echo "C8 active theme matches the server: $got_theme"

# Archives readable.
tar tzf c5-content.tgz > /dev/null || fail "c5-content.tgz unreadable"
tar tzf c5-nginx-etc.tgz > /dev/null || fail "c5-nginx-etc.tgz unreadable"
unzip -tq backup-from-v*.zip > /dev/null || fail "the ghost backup zip is damaged"
echo "C3/C5 archives readable"

# C2 and C6: the Admin downloads, saved by the owner into the admin/ subfolder.
[ -d admin ] || fail "admin/ subfolder missing (C2 and C6 downloads)"
set -- admin/*.json; J="$1"; [ -f "$J" ] || fail "no C2 content export (*.json) in admin/"
json_posts="$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(len(d["db"][0]["data"]["posts"]))' "$J")" \
  || fail "the C2 export is not valid Ghost JSON"
echo "C2 export $(basename "$J"): $json_posts posts/pages (database: $want_posts)"
if [ "$json_posts" != "$want_posts" ]; then
  REVIEW+=("C2 export has $json_posts posts/pages but the database has $want_posts (the export may have been taken at a different moment, or may leave some rows out)")
  echo "REVIEW REQUIRED: C2 export count $json_posts differs from the database count $want_posts"
fi
[ -f admin/routes.yaml ] || fail "no C6 routes.yaml in admin/"
tar xzf c5-content.tgz -O content/settings/routes.yaml | cmp -s - admin/routes.yaml \
  && echo "C6 routes.yaml matches the server copy" || fail "admin/routes.yaml differs from content/settings/routes.yaml"
set -- admin/redirects.*; [ "$#" -eq 1 ] && [ -f "$1" ] || fail "expected exactly one C6 redirects file in admin/"
# Format check only (read-only; the file is never changed). Ghost accepts YAML (301:/302: maps) or JSON (a list of {from, to}).
rmsg="$(python3 - "$1" <<'PY'
import json, re, sys
p = sys.argv[1]; t = open(p, encoding="utf-8").read()
if p.endswith(".json"):
    d = json.loads(t) if t.strip() else []
    assert isinstance(d, list), "JSON redirects must be a list"
    for r in d:
        assert isinstance(r, dict) and isinstance(r.get("from"), str) and isinstance(r.get("to"), str), f"bad JSON rule: {r!r}"
    print(f"JSON, {len(d)} rule(s)")
elif p.endswith((".yaml", ".yml")):
    try:
        import yaml
        d = yaml.safe_load(t) or {}
        assert isinstance(d, dict), "YAML redirects must be a map"
        assert set(map(str, d)) <= {"301", "302"}, f"unexpected top-level keys: {sorted(map(str, d))}"
        n = 0
        for k, v in d.items():
            v = v or {}
            assert isinstance(v, dict) and all(isinstance(a, str) and isinstance(b, str) for a, b in v.items()), f"bad rules under {k}"
            n += len(v)
        print(f"YAML (parsed), {n} rule(s)")
    except ImportError:
        n = 0
        for line in t.splitlines():
            if not line.strip() or line.lstrip().startswith("#"): continue
            if re.fullmatch(r"(301|302):\s*(\{\s*\})?\s*", line): continue
            assert re.fullmatch(r"\s+\S.*:\s+\S.*", line), f"unexpected line: {line!r}"
            n += 1
        print(f"YAML (line check), {n} rule(s)")
else:
    raise SystemExit("unknown redirects file type")
PY
)" || fail "the C6 redirects file is not in a valid Ghost redirects format"
echo "C6 redirects: $(basename "$1"): $rmsg (format valid; file not changed)"
set -- admin/*.zip; [ -f "$1" ] || fail "no C6 theme zip in admin/"
unzip -tq "$1" > /dev/null || fail "the C6 theme zip is damaged"
echo "C6 theme: $(basename "$1") (readable; active theme in the database: $got_theme)"

echo
if [ "${#REVIEW[@]}" -gt 0 ]; then
  echo "C8 RESTORE COMPLETED, REVIEW REQUIRED (${#REVIEW[@]} item(s)); this is not a pass until reviewed:"
  printf '  - %s\n' "${REVIEW[@]}"
  exit 2
fi
echo "C8 RESTORE TEST PASSED"
