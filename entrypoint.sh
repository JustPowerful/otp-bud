#!/bin/sh

# This is the entrypoint script for the backend container. 
# It migrates the database and then starts the backend server.
set -e # Exit immediately if a command exits with a non-zero status.
echo "Migrating database..."
if [ -f .env ]; then
	set -a
	. .env
	set +a
fi
pnpm run db:migrate

echo "Starting app..."
exec node dist/src/main.js