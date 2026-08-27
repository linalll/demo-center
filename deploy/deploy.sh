#!/usr/bin/env bash
# Deploys the current working tree to the production server.
#
# Usage:  ./deploy/deploy.sh
#
# Requires the "anmka-server" SSH host alias (already configured in this
# machine's ~/.ssh/config, using the dedicated ~/.ssh/anmka_deploy key).
# Does NOT touch .env on the server — production secrets stay there only.

set -euo pipefail

REMOTE_HOST="anmka-server"
REMOTE_PATH="/home/adminanmkavps/web/centar.anmka.com/public_html"
PM2_APP_NAME="centar-anmka-com"

cd "$(dirname "$0")/.."

echo "==> Syncing project files to $REMOTE_HOST:$REMOTE_PATH"
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.pgdata' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude 'scripts/find-*.mjs' \
  -e "ssh" \
  ./ "$REMOTE_HOST:$REMOTE_PATH/"

echo "==> Installing dependencies, running migrations, and building on the server"
# shellcheck disable=SC2029
ssh "$REMOTE_HOST" "cd $REMOTE_PATH && \
  npm install && \
  npx prisma generate && \
  npx prisma db push --skip-generate && \
  npm run build"

echo "==> Restarting the app via PM2"
ssh "$REMOTE_HOST" "cd $REMOTE_PATH && pm2 restart $PM2_APP_NAME || pm2 start npm --name $PM2_APP_NAME --update-env -- start -- -p 4177"
ssh "$REMOTE_HOST" "pm2 save"

echo "==> Done. Live at https://centar.anmka.com/"
