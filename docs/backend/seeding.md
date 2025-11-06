# Seeding & Test Data

- **Seed script**: `backend/src/seeds/seed.ts`
  - Creates org root, users (`admin@epop.local`, etc.), a project with buckets/tasks, a general chat with a welcome message.

- **Run locally (dev)**
```bash
npm --prefix backend run migrate:run:dev
npm --prefix backend run seed:dev
```

- **Run in prod build artifacts**
```bash
npm --prefix backend run migrate:run
npm --prefix backend run seed:prod
```

- Ensure DB/Redis env vars are set (defaults provided in `env.validation.ts`).
