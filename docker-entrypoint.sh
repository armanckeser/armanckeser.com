#!/bin/bash
set -e

REPO_DIR="${REPO_PATH:-/app/repo}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Warning: GITHUB_TOKEN not set, git push will not work"
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Cloning repository..."
  git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/armanckeser/armanckeser.com.git" "$REPO_DIR"
else
  echo "Pulling latest changes..."
  cd "$REPO_DIR" && git pull --rebase || true
fi

cd "$REPO_DIR"
git config user.name "${GIT_USER_NAME:-CMS Bot}"
git config user.email "${GIT_USER_EMAIL:-cms@armanckeser.com}"

if [ -n "$GITHUB_TOKEN" ]; then
  git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/armanckeser/armanckeser.com.git"
fi

export REPO_PATH="$REPO_DIR"

cd /app
exec "$@"
