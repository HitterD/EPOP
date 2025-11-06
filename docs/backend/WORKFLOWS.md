# Workflows API (Wave-1)

- Base path: `/api/v1/workflows`
- Auth: Bearer JWT (cookie-based in app); admin-only enable/disable policy to be added later.

## Endpoints
- GET `/` — list workflows
- GET `/:id` — get one
- POST `/` — create `{ name, jsonSpec, isActive? }`
- PUT `/:id` — update partial
- DELETE `/:id` — delete
- POST `/:id/enable` — set active=true
- POST `/:id/disable` — set active=false
- POST `/run:test` — run a simulated test `{ workflowId? | spec }`

## Storage
- `workflows`: `id, name, is_active, json_spec, created_by, created_at, updated_at`
- `workflow_runs`: `id, workflow_id, status, started_at, finished_at, logs jsonb`

## Notes
- Engine will run asynchronously in Wave-4. For now, `run:test` simulates a single trigger->action validation and records an execution.
- `logs` column stores result or error metadata for auditing.
