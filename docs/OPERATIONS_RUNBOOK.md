# NestSphere ERP Operations & Incident Runbook

## 1. System Health Diagnostics
- **Healthcheck Endpoint**: `GET /api/v1/health`
- **Prometheus Metrics**: `GET /api/v1/metrics`
- **Kubernetes Pod Status**:
  ```bash
  kubectl get pods -l app=nestsphere-backend
  ```

## 2. Disaster Recovery & Database Restoration
1. Locate latest automated backup:
   ```bash
   ls -la /var/backups/nestsphere/
   ```
2. Execute restoration script:
   ```bash
   ./scripts/restore.sh /var/backups/nestsphere/nestsphere_backup_YYYYMMDD.sql.gz
   ```

## 3. High Load Incident Response
- If CPU exceeds 80%, Horizontal Pod Autoscaler (HPA) will automatically scale backend replicas up to 10.
- Manual scale-up command:
  ```bash
  kubectl scale deployment/nestsphere-backend --replicas=8
  ```

## 4. Log Inspection
- Stream live backend logs:
  ```bash
  kubectl logs -f -l app=nestsphere-backend --tail=100
  ```
