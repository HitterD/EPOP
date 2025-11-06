# Runbook: Backup & Restore

- **Database (PostgreSQL)**
  - Nightly dump (example cron): `pg_dump -Fc -h <host> -U epop epop > /backups/epop_$(date +%F).dump`
  - Restore: `pg_restore -c -d epop -h <host> -U epop /backups/epop_YYYY-MM-DD.dump`

- **MinIO (S3-compatible)**
  - Enable lifecycle policies for temporary uploads, retention of finalized files.
  - CLI copy (example): `mc mirror minio/epop s3://backup-bucket/epop`

- **Search (ZincSearch)**
  - Backup data path volume; reindex via `PUT /search/index/:entity` if needed.

- **Disaster recovery checklist**
  - Verify DB connectivity (`/health/ready`).
  - Restore DB snapshot.
  - Restore MinIO objects.
  - Reindex search.
