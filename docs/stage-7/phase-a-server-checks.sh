#!/usr/bin/env bash
# Stage 7, Phase A: READ-ONLY server checks I1–I21 and I30 for the himandme.my VPS.
#
# What it does: only reads and reports. It changes NOTHING (no restart, no fix, no update, no write
# outside the report file). It never prints passwords, keys or tokens: the Ghost config is printed with
# every field whose name contains password/pass/secret/token/key/auth/user removed.
#
# How to run (as your normal sudo user, NOT root; it asks for your sudo password once):
#   bash phase-a-server-checks.sh            # default install folder /var/www/himandme
#   GHOST_DIR=/var/www/other bash phase-a-server-checks.sh
# The report is written to ~/phase-a-report.txt. Read it before sharing. It should hold no secrets;
# if you see one, delete that line.
set -u
GHOST_DIR="${GHOST_DIR:-/var/www/himandme}"
OUT="$HOME/phase-a-report.txt"
exec > >(tee "$OUT") 2>&1
h() { printf '\n===== %s =====\n' "$1"; }
run() { printf '$ %s\n' "$*"; "$@" 2>&1 | sed 's/^/  /'; }
sudo -v || { echo "sudo is needed for some read-only checks"; exit 1; }
echo "Phase A read-only report · $(date -u +%FT%TZ) · install folder: $GHOST_DIR"

h "I1 OS"; run lsb_release -d; run uname -r; run uptime; [ -f /var/run/reboot-required ] && echo "  REBOOT REQUIRED" || echo "  no reboot pending"
h "I2 Ghost / Ghost-CLI"; (cd "$GHOST_DIR" && run ghost version && run ghost ls)
h "I3 Ghost config (secrets removed)"
sudo python3 - "$GHOST_DIR/config.production.json" <<'PY'
import json, re, sys
bad = re.compile(r'pass|secret|token|key|auth|user', re.I)
def clean(o):
    if isinstance(o, dict): return {k: ('[removed]' if bad.search(k) else clean(v)) for k, v in o.items()}
    if isinstance(o, list): return [clean(v) for v in o]
    return o
print(json.dumps(clean(json.load(open(sys.argv[1]))), indent=2))
PY
h "I4/I15 ghost doctor (checks only)"; (cd "$GHOST_DIR" && run ghost doctor --no-prompt)
h "I5 Node"; run node -v; run which node
SVC=$(systemctl list-units --type=service --all --no-legend 'ghost_*' | awk '{print $1}' | head -1)
h "I6 systemd ($SVC)"; run systemctl is-enabled "$SVC"; run systemctl is-active "$SVC"; systemctl cat "$SVC" | grep -E '^(User|ExecStart|Environment)=' | sed 's/^/  /'
h "I7 errors in the last 7 days (count, then last 20 lines)"; sudo journalctl -u "$SVC" --since "7 days ago" -p err --no-pager | wc -l | sed 's/^/  count: /'; sudo journalctl -u "$SVC" --since "7 days ago" -p err --no-pager | tail -20 | sed 's/^/  /'
h "I8 ownership"; run ls -ld "$GHOST_DIR" "$GHOST_DIR/content"; echo "  files under content/ not owned by ghost (first 10):"; sudo find "$GHOST_DIR/content" ! -user ghost | head -10 | sed 's/^/  /'
h "I9 nginx"; run sudo nginx -t; run ls -l /etc/nginx/sites-enabled/
h "I10 nginx proxy and headers"; sudo grep -nE 'proxy_pass|server_name|client_max_body_size|real_ip|add_header|ssl_certificate ' /etc/nginx/sites-available/* 2>/dev/null | sed 's/^/  /'
h "I11 certificate"; for host in himandme.my www.himandme.my; do echo "  -- $host"; echo | openssl s_client -connect 127.0.0.1:443 -servername "$host" 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName 2>/dev/null | sed 's/^/  /'; done
h "I12 certificate renewal"; sudo crontab -l -u root 2>/dev/null | grep -i acme | sed 's/^/  /'; sudo ls /etc/letsencrypt/ 2>/dev/null | sed 's/^/  /'; systemctl list-timers --all --no-pager 2>/dev/null | grep -iE 'certbot|acme' | sed 's/^/  /'
h "I13 redirects (from the server, through DNS)"; for u in http://himandme.my/ https://himandme.my/ http://www.himandme.my/ https://www.himandme.my/; do curl -s -o /dev/null -m 15 -w "  %{http_code} -> %{redirect_url}  ($u) %{errormsg}\n" "$u"; done
h "I14 MySQL"; run systemctl is-active mysql; run mysql --version
h "I16 disk"; run df -h / /var/www /var/lib/mysql; sudo du -sh "$GHOST_DIR/content" | sed 's/^/  content: /'
h "I17 memory"; run free -h
h "I18 firewall"; run sudo ufw status verbose
h "I19 listening ports"; sudo ss -tlnp | grep -E ':(22|80|443|2368|3306)\b' | sed 's/^/  /'
h "I20 SSH"; sudo sshd -T 2>/dev/null | grep -Ei '^(port|permitrootlogin|passwordauthentication|pubkeyauthentication|kbdinteractiveauthentication) ' | sed 's/^/  /'
h "I21 pending updates"; apt list --upgradable 2>/dev/null | tail -n +2 | wc -l | sed 's/^/  upgradable packages: /'; apt list --upgradable 2>/dev/null | grep -i security | wc -l | sed 's/^/  of which from security: /'
h "I30 MySQL backup access (no secrets)"; sudo mysql -e "SELECT user, host, plugin FROM mysql.user WHERE user='root'; SELECT @@version, @@character_set_server, @@collation_server; SELECT table_schema, ROUND(SUM(data_length+index_length)/1024/1024,1) AS mb FROM information_schema.tables WHERE table_schema NOT IN ('mysql','sys','performance_schema','information_schema') GROUP BY table_schema;" 2>&1 | sed 's/^/  /'
echo; echo "Done. Report: $OUT (read it before sharing). Nothing was changed."
