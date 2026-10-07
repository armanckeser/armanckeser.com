#!/bin/bash
# Gets the clone the studio runs from up to date, then starts it there.
set -e

REPO_DIR="${REPO_PATH:-/app/repo}"
TOKEN="${GH_PAT:-$GITHUB_TOKEN}"
REMOTE="https://github.com/armanckeser/armanckeser.com.git"
[ -n "$TOKEN" ] && REMOTE="https://x-access-token:${TOKEN}@github.com/armanckeser/armanckeser.com.git"
[ -z "$TOKEN" ] && echo "studio: no GH_PAT, so publishing (git push) will fail"

if [ ! -d "$REPO_DIR/.git" ]; then
	echo "studio: cloning the site"
	git clone "$REMOTE" "$REPO_DIR"
fi

cd "$REPO_DIR"
git config user.name "${GIT_USER_NAME:-Armanc Keser}"
git config user.email "${GIT_USER_EMAIL:-cms@armanckeser.com}"
git remote set-url origin "$REMOTE"
git config pull.rebase true

# Drafts are untracked files and survive this. Tracked edits that were never
# published are stashed (not lost) if they get in the way of main.
git fetch origin main
git checkout -q main 2>/dev/null || git checkout -q -b main origin/main
if ! git pull -q --rebase --autostash origin main; then
	git rebase --abort 2>/dev/null || true
	git stash push -q -m "studio start $(date -Iseconds)" || true
	git reset -q --hard origin/main
	echo "studio: local changes were in the way of main; they are in 'git stash list'"
fi
echo "studio: running $(git log -1 --format='%h %s')"

# The image's dependencies serve the clone.
if [ ! -e node_modules ] || [ -L node_modules ]; then
	ln -sfn /app/node_modules node_modules
fi
if ! cmp -s bun.lock /app/bun.lock; then
	echo "studio: bun.lock differs from the image's; rebuild the image if something fails to resolve"
fi

# The first page render compiles most of the site, which on the Pi takes longer
# than the proxy waits. Render the studio and a post once in the background so
# the first real visit is quick.
(sleep 10 && node --input-type=module -e '
for (const path of ["/cms", "/writing/sixth-year"]) await fetch("http://localhost:" + (process.env.PORT || 3000) + path).catch(() => {})
' >/dev/null 2>&1) &

exec "$@"
