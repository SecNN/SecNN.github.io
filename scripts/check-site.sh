#!/usr/bin/env sh
set -eu

git diff --check
node scripts/check-site.mjs
node --check assets/sponsors.js
node --check assets/site-footer.js

echo "全部自动化检查通过。"
