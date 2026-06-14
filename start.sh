#!/bin/sh
set -e

echo "Running database migrations..."
prisma migrate deploy

echo "Syncing database schema..."
prisma db push --skip-generate

echo "Starting server..."
node server.js
