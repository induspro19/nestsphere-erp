# NestSphere ERP — Enterprise Operations & Commercial Runbook

**Target Version**: `v1.0.1 Commercial Production Baseline`  
**Document Type**: Standard Operating Procedures (SOP), Maintenance & Disaster Recovery Runbook

---

## 📅 1. Operational Task Cadence

### Daily Operational Tasks
- [ ] **Health Check Monitoring**: Verify `/api/health` returns HTTP 200 OK.
- [ ] **Database Backup Verification**: Verify daily automated PostgreSQL dump executed in `/var/backups/nestsphere/`.
- [ ] **Payment Gateway Sync**: Reconcile Webhook logs against Razorpay/Stripe settled transactions.
- [ ] **Visitor Gatekeeper Kiosk Heartbeat**: Confirm active socket connections for security gates.

### Weekly Operational Tasks
- [ ] **Log Rotation & Vacuum**: Rotate NestJS application logs and run PostgreSQL `VACUUM ANALYZE`.
- [ ] **Disk Usage & Storage Audit**: Monitor object storage buckets (PDF bills, resident documents, media attachments).
- [ ] **P0 / P1 Issue Triage**: Review pilot society bug reports and tag severity (P0-P3).

### Monthly Operational Tasks
- [ ] **Disaster Recovery Restore Drill**: Execute full database restore on staging environment (`scripts/restore-db.sh`).
- [ ] **Financial Ledger Reconciliation**: Verify society billing totals against bank statements and trial balances.
- [ ] **Security Vulnerability Scan**: Run `npm audit` across backend and frontend dependencies.

### Year-End Operational Tasks
- [ ] **Financial Year Closing**: Roll over financial years and archive transaction ledgers.
- [ ] **SSL / TLS & Domain Renewal**: Audit SSL certificates and custom domain DNS records.
- [ ] **Committee Tenure Expiry Audit**: Check active committees nearing 2-year tenure expiry.

---

## 💾 2. Automated Backup & Disaster Recovery Procedures

### Database Backup Procedure (`scripts/backup-db.sh`)
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/nestsphere"
mkdir -p $BACKUP_DIR
pg_dump -U postgres -d nestsphere_prod | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz
echo "Backup generated: db_backup_$TIMESTAMP.sql.gz"
```

### Database Disaster Recovery Restore Drill (`scripts/restore-db.sh`)
```bash
#!/bin/bash
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh /path/to/backup.sql.gz"
  exit 1
fi
gunzip -c $BACKUP_FILE | psql -U postgres -d nestsphere_prod
echo "Database restore completed successfully."
```

### Recovery Targets (SLAs)
- **Recovery Time Objective (RTO)**: ≤ 2 hours
- **Recovery Point Objective (RPO)**: ≤ 15 minutes

---

## 📊 3. Product SLA & Telemetry Dashboard

| Metric / KPI | Target | Alert Threshold | Escalation Action |
| :--- | :--- | :--- | :--- |
| **System Uptime** | 99.9%+ | < 99.5% | P0 Alert to Lead Engineer |
| **Successful Payments** | > 99.0% | < 97.0% | Audit Gateway Webhooks |
| **P0 Open Incidents** | 0 | > 0 | Immediate Code Freeze & Hotfix |
| **Average API Latency** | < 500ms | > 1000ms | Optimize DB Indexes / Redis Cache |
| **Dashboard Load Time** | < 1.0s | > 2.5s | Lazy-load heavy widgets |

---

## 🚨 4. Production Incident Response Checklist

In the event of a production incident:

1. **Acknowledge & Triage**: Confirm P0/P1 severity and notify society admin.
2. **Isolate Root Cause**: Inspect application logs (`tail -f /var/log/nestsphere/app.log`) and database connection pools.
3. **Execute Emergency Rollback**: If code bug, revert to previous release tag (`v1.0.1`).
4. **Post-Mortem**: Document root cause, resolution time, and preventive measure in `INCIDENT_LOG.md`.

---

*NestSphere ERP Version 1.0.1 — Standard Operating Runbook Certified.*
