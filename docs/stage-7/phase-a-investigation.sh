#!/usr/bin/env bash
# Stage 7, Phase A follow-up: READ-ONLY investigation (updates, reboot, SSH, Nginx default site,
# certificate renewal, headers, mail). It changes NOTHING: no apt update/upgrade, no restart, no
# reload, no edit. It never prints passwords, keys or tokens: SSH keys appear only as fingerprints,
# acme.sh settings only as an allow-list of non-secret fields, and the Ghost mail section only as
# the transport name.
#
# Run as your normal sudo user (asks for the sudo password once):
#   bash phase-a-investigation.sh
# Report: ~/phase-a-investigation.txt (read it before sharing).
set -u
GHOST_DIR="${GHOST_DIR:-/var/www/himandme}"
OUT="$HOME/phase-a-investigation.txt"
exec > >(tee "$OUT") 2>&1
h() { printf '\n===== %s =====\n' "$1"; }
sudo -v || exit 1
echo "Phase A investigation (read-only) · $(date -u +%FT%TZ)"

h "U1 Pending updates (from the local apt cache; NOT refreshed, so it may be a little old)"
echo "  apt cache last refreshed: $(stat -c %y /var/lib/apt/periodic/update-success-stamp 2>/dev/null || ls -ld --time-style=full-iso /var/lib/apt/lists | awk '{print $6, $7}')"
echo "  --- security (from *-security pockets) ---"
apt list --upgradable 2>/dev/null | tail -n +2 | grep -- '-security' | sed 's/^/  /'
echo "  --- other (updates / ESM / third-party) ---"
apt list --upgradable 2>/dev/null | tail -n +2 | grep -v -- '-security' | sed 's/^/  /'
echo "  --- installed versions of key packages ---"
dpkg-query -W -f='  ${Package} ${Version}\n' nginx nginx-common mysql-server-8.0 openssh-server openssl libssl3t64 nodejs linux-image-generic systemd 2>/dev/null
echo "  --- automatic security updates ---"
cat /etc/apt/apt.conf.d/20auto-upgrades 2>/dev/null | sed 's/^/  /'
systemctl is-enabled unattended-upgrades 2>/dev/null | sed 's/^/  unattended-upgrades service: /'
sudo tail -n 5 /var/log/unattended-upgrades/unattended-upgrades.log 2>/dev/null | sed 's/^/  /'

h "U2 Why a restart is required"
echo "  /var/run/reboot-required.pkgs:"; cat /var/run/reboot-required.pkgs 2>/dev/null | sed 's/^/    /'
ls -l --time-style=long-iso /var/run/reboot-required 2>/dev/null | sed 's/^/  /'
echo "  running kernel: $(uname -r)"; echo "  installed kernels:"; ls -1 /boot/vmlinuz-* 2>/dev/null | sed 's/^/    /'
echo "  services still using old libraries (list only, nothing restarted):"
if command -v needrestart >/dev/null; then sudo needrestart -b -r l 2>/dev/null | sed 's/^/    /'; else echo "    needrestart not installed"; fi

h "S1 SSH configuration sources (no keys printed)"
sudo grep -nEv '^\s*(#|$)' /etc/ssh/sshd_config | sed 's/^/  sshd_config:/'
for f in /etc/ssh/sshd_config.d/*.conf; do [ -e "$f" ] && sudo grep -nEv '^\s*(#|$)' "$f" | sed "s#^#  $f:#"; done
echo "  effective values:"; sudo sshd -T 2>/dev/null | grep -Ei '^(port|listenaddress|permitrootlogin|passwordauthentication|pubkeyauthentication|kbdinteractiveauthentication|authenticationmethods|maxauthtries|allowusers|allowgroups|usepam|permitemptypasswords|x11forwarding) ' | sed 's/^/    /'
echo "  ssh units:"; systemctl is-active ssh.socket ssh.service 2>/dev/null | paste - - | sed 's/^/    socket, service: /'
echo "  login-capable users (shell not nologin/false):"; awk -F: '$7 !~ /(nologin|false)$/ {print "    " $1 " uid=" $3 " shell=" $7}' /etc/passwd
for u in root $(awk -F: '$3>=1000 && $7 !~ /(nologin|false)$/ {print $1}' /etc/passwd); do
  d=$(getent passwd "$u" | cut -d: -f6); f="$d/.ssh/authorized_keys"
  if sudo test -s "$f"; then echo "    $u: $(sudo grep -cE '^(ssh-|ecdsa-|sk-)' "$f") key(s):"; sudo ssh-keygen -lf "$f" 2>/dev/null | awk '{print "      " $1, $2, $NF}'; else echo "    $u: no authorized_keys"; fi
done
echo "  sudo group: $(getent group sudo | cut -d: -f4)"
echo "  failed SSH logins, last 7 days: $(sudo journalctl -u ssh -u ssh.service --since '7 days ago' --no-pager 2>/dev/null | grep -cE 'Failed password|Invalid user')"
echo "  successful logins by method, last 7 days:"; sudo journalctl -u ssh -u ssh.service --since '7 days ago' --no-pager 2>/dev/null | grep -oE 'Accepted (password|publickey) for [a-z0-9_-]+' | sort | uniq -c | sed 's/^/    /'
command -v fail2ban-client >/dev/null && echo "  fail2ban: installed" || echo "  fail2ban: not installed"

h "N1 Nginx default site and server selection"
echo "  default site (non-comment lines):"; grep -nEv '^\s*(#|$)' /etc/nginx/sites-available/default | sed 's/^/    /'
echo "  default_server flags anywhere:"; sudo grep -rn 'default_server' /etc/nginx/ 2>/dev/null | sed 's/^/    /'
echo "  /var/www/html contents:"; ls -la /var/www/html 2>/dev/null | sed 's/^/    /'
echo "  what answers each host (through this server, port 80 and 443):"
for host in himandme.my www.himandme.my unknown.invalid; do
  printf '    http  %-16s ' "$host"; curl -s -m 10 -o /tmp/.pa_body -w '%{http_code} -> %{redirect_url} ' -H "Host: $host" http://127.0.0.1/ ; grep -o '<title>[^<]*' /tmp/.pa_body | head -1
  printf '    https %-16s ' "$host"; curl -sk -m 10 -o /tmp/.pa_body -w '%{http_code} -> %{redirect_url} ' --resolve "$host:443:127.0.0.1" "https://$host/" ; grep -o '<title>[^<]*' /tmp/.pa_body | head -1
done; rm -f /tmp/.pa_body
echo "  bare IP over https (cert served):"; echo | openssl s_client -connect 127.0.0.1:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null | sed 's/^/    /'

h "N2 Full Him & Me Nginx server blocks (no secrets in these files; key file shown as a path only)"
for f in /etc/nginx/sites-available/himandme.my.conf /etc/nginx/sites-available/himandme.my-ssl.conf; do echo "  --- $f"; grep -nEv '^\s*(#|$)' "$f" | sed 's/^/    /'; done
echo "  --- maps/snippets referenced"; sudo grep -rn 'header_content_type_options\|activitypub_upstream' /etc/nginx/ 2>/dev/null | grep -v sites-available/himandme | sed 's/^/    /'
echo "  --- live response headers (https)"; curl -sk -m 10 -D - -o /dev/null --resolve himandme.my:443:127.0.0.1 https://himandme.my/ | sed 's/^/    /'

h "C1 Certificate renewal (acme.sh; non-secret fields only)"
sudo /etc/letsencrypt/acme.sh --list --home /etc/letsencrypt 2>/dev/null | sed 's/^/  /'
sudo grep -E "^(Le_Domain|Le_Alt|Le_Webroot|Le_PreHook|Le_PostHook|Le_RenewHook|Le_ReloadCmd|Le_API|Le_Keylength|Le_NextRenewTimeStr|Le_CertCreateTimeStr|Le_RealCertPath|Le_RealKeyPath|Le_RealFullChainPath)=" /etc/letsencrypt/himandme.my/himandme.my.conf 2>/dev/null | sed 's/^/  /'
echo "  acme.sh version: $(sudo /etc/letsencrypt/acme.sh --version --home /etc/letsencrypt 2>/dev/null | tail -1)"
echo "  ACME challenge location in nginx:"; sudo grep -rn 'well-known' /etc/nginx/sites-available/ 2>/dev/null | sed 's/^/    /'
echo "  DNS as seen from the server:"; for n in himandme.my www.himandme.my; do echo "    $n: $(getent ahostsv4 $n | awk '{print $1}' | sort -u | tr '\n' ' ')"; done
echo "  this server's addresses:"; ip -4 -o addr show scope global | awk '{print "    " $2, $4}'

h "M1 Ghost mail (transport only) and outbound SMTP reachability"
sudo python3 -c "import json;c=json.load(open('$GHOST_DIR/config.production.json'));m=c.get('mail',{});print('  transport:',m.get('transport'),'| host:',(m.get('options') or {}).get('host'),'| staffDeviceVerification:',c.get('security',{}).get('staffDeviceVerification'))"
for hp in gmail-smtp-in.l.google.com:25 smtp.gmail.com:587; do timeout 6 bash -c "</dev/tcp/${hp%:*}/${hp#*:}" 2>/dev/null && echo "  outbound $hp: open" || echo "  outbound $hp: blocked or unreachable"; done
echo "  mail errors in Ghost logs (count):"; sudo grep -hiE 'mail|smtp' "$GHOST_DIR"/content/logs/*error*.log 2>/dev/null | wc -l | sed 's/^/    /'
echo; echo "Done. Nothing was changed. Report: $OUT"
