#!/bin/sh
set -e

PRISMA="node node_modules/prisma/build/index.js"

echo "Resolving migration baseline (marks existing migrations as applied)..."
$PRISMA migrate resolve --applied 20260613000000_init 2>/dev/null || true
$PRISMA migrate resolve --applied 20260613020000_genre_to_project_type 2>/dev/null || true
$PRISMA migrate resolve --applied 20260614000000_add_sections_and_parent_id 2>/dev/null || true

echo "Running pending migrations..."
$PRISMA migrate deploy

echo "Migrations complete!"
