#!/usr/bin/env bash
# Vercel install script: authenticate github clones against the private
# broadway-data repo using GH_TOKEN (set as a Vercel environment variable).
set -euo pipefail

if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: GH_TOKEN env var not set; cannot clone private broadway-data" >&2
  exit 1
fi

TOKEN_URL="https://x-access-token:${GH_TOKEN}@github.com/"
git config --global --add url."$TOKEN_URL".insteadOf "ssh://git@github.com/"
git config --global --add url."$TOKEN_URL".insteadOf "git@github.com:"
git config --global --add url."$TOKEN_URL".insteadOf "https://github.com/"

npm ci
