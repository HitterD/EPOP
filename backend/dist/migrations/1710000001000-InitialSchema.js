"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1710000001000 = void 0;
class InitialSchema1710000001000 {
    name = 'InitialSchema1710000001000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS org_units (
        id BIGSERIAL PRIMARY KEY,
        parent_id BIGINT REFERENCES org_units(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        code TEXT UNIQUE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email CITEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        org_unit_id BIGINT REFERENCES org_units(id),
        phone_ext TEXT,
        presence TEXT NOT NULL DEFAULT 'offline',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id BIGSERIAL PRIMARY KEY,
        is_group BOOLEAN NOT NULL DEFAULT FALSE,
        title TEXT,
        created_by BIGINT REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        pinned BOOLEAN DEFAULT FALSE,
        muted BOOLEAN DEFAULT FALSE,
        PRIMARY KEY(chat_id, user_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGSERIAL PRIMARY KEY,
        chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE,
        sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        content_json JSONB NOT NULL,
        delivery TEXT DEFAULT 'normal',
        root_message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        edited_at TIMESTAMPTZ
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY(message_id, user_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY(message_id, user_id, emoji)
      );
    `);
        await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mailbox') THEN
          CREATE TYPE mailbox AS ENUM('received','sent','deleted');
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS mail_messages (
        id BIGSERIAL PRIMARY KEY,
        from_user BIGINT REFERENCES users(id),
        to_users BIGINT[] NOT NULL,
        subject TEXT,
        body_html TEXT,
        folder mailbox NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS files (
        id BIGSERIAL PRIMARY KEY,
        owner_id BIGINT REFERENCES users(id),
        filename TEXT NOT NULL,
        mime TEXT,
        size BIGINT,
        s3_key TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS file_links (
        id BIGSERIAL PRIMARY KEY,
        file_id BIGINT REFERENCES files(id) ON DELETE CASCADE,
        ref_table TEXT NOT NULL,
        ref_id BIGINT NOT NULL
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id BIGINT REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        PRIMARY KEY(project_id,user_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_buckets (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        position INT NOT NULL
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGSERIAL PRIMARY KEY,
        project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
        bucket_id BIGINT REFERENCES task_buckets(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        progress TEXT DEFAULT 'not_started',
        start_at DATE,
        due_at DATE,
        position INT NOT NULL,
        created_by BIGINT REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_project_bucket_position ON tasks(project_id, bucket_id, position);
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY(task_id, user_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id BIGSERIAL PRIMARY KEY,
        task_id BIGINT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id BIGINT REFERENCES users(id),
        body TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS domain_outbox (
        id BIGSERIAL PRIMARY KEY,
        event_name TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        aggregate_id BIGINT NOT NULL,
        user_id BIGINT,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        delivered_at TIMESTAMPTZ
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_unit_id);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_presence ON users(presence);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_task_due ON tasks(due_at);
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_task_due;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_chat_participants_user;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_message_reads_user;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_presence;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_org;`);
        await queryRunner.query(`DROP TABLE IF EXISTS domain_outbox;`);
        await queryRunner.query(`DROP TABLE IF EXISTS task_comments;`);
        await queryRunner.query(`DROP TABLE IF EXISTS task_assignees;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_project_bucket_position;`);
        await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
        await queryRunner.query(`DROP TABLE IF EXISTS task_buckets;`);
        await queryRunner.query(`DROP TABLE IF EXISTS project_members;`);
        await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
        await queryRunner.query(`DROP TABLE IF EXISTS file_links;`);
        await queryRunner.query(`DROP TABLE IF EXISTS files;`);
        await queryRunner.query(`DROP TABLE IF EXISTS mail_messages;`);
        await queryRunner.query(`DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mailbox') THEN DROP TYPE mailbox; END IF; END $$;`);
        await queryRunner.query(`DROP TABLE IF EXISTS message_reactions;`);
        await queryRunner.query(`DROP TABLE IF EXISTS message_reads;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_chat_created;`);
        await queryRunner.query(`DROP TABLE IF EXISTS messages;`);
        await queryRunner.query(`DROP TABLE IF EXISTS chat_participants;`);
        await queryRunner.query(`DROP TABLE IF EXISTS chats;`);
        await queryRunner.query(`DROP TABLE IF EXISTS users;`);
        await queryRunner.query(`DROP TABLE IF EXISTS org_units;`);
    }
}
exports.InitialSchema1710000001000 = InitialSchema1710000001000;
//# sourceMappingURL=1710000001000-InitialSchema.js.map