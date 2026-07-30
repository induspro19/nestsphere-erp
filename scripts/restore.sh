#!/bin/bash

# NestSphere ERP Automated PostgreSQL Restore Script
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <path_to_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

echo "[$(date)] Starting Database Restoration from '${BACKUP_FILE}'..."

PGPASSWORD="${POSTGRES_PASSWORD:-nestsphere_secret_2026}" gunzip -c "${BACKUP_FILE}" | psql -h "${POSTGRES_HOST:-localhost}" -U "${POSTGRES_USER:-nestsphere}" -d "${POSTGRES_DB:-nestsphere_erp}"

echo "[$(date)] Database Restoration Completed Successfully!"
