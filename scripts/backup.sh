#!/bin/bash

# NestSphere ERP Automated PostgreSQL Backup Script
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/nestsphere"
BACKUP_FILE="${BACKUP_DIR}/nestsphere_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p ${BACKUP_DIR}

echo "[$(date)] Starting NestSphere Database Backup..."

# Perform pg_dump
PGPASSWORD="${POSTGRES_PASSWORD:-nestsphere_secret_2026}" pg_dump -h "${POSTGRES_HOST:-localhost}" -U "${POSTGRES_USER:-nestsphere}" -d "${POSTGRES_DB:-nestsphere_erp}" | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"

# Retention cleanup (delete backups older than RETENTION_DAYS)
find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days."
