import 'reflect-metadata'
import AppDataSource from '../database/data-source'
import { User } from '../entities/user.entity'
import { OrgUnit } from '../entities/org-unit.entity'
import { Project } from '../entities/project.entity'
import { ProjectMember } from '../entities/project-member.entity'
import { TaskBucket } from '../entities/task-bucket.entity'
import { Task } from '../entities/task.entity'
import { Chat } from '../entities/chat.entity'
import { ChatParticipant } from '../entities/chat-participant.entity'
import { Message } from '../entities/message.entity'
import * as argon2 from 'argon2'

async function run() {
  await AppDataSource.initialize()
  const users = AppDataSource.getRepository(User)
  const orgs = AppDataSource.getRepository(OrgUnit)
  const projects = AppDataSource.getRepository(Project)
  const members = AppDataSource.getRepository(ProjectMember)
  const buckets = AppDataSource.getRepository(TaskBucket)
  const tasks = AppDataSource.getRepository(Task)
  const chats = AppDataSource.getRepository(Chat)
  const parts = AppDataSource.getRepository(ChatParticipant)
  const messages = AppDataSource.getRepository(Message)

  // Org
  const root = await orgs.save(orgs.create({ name: 'Headquarters', code: 'HQ' }))

  // Users
  const admin = await users.save(users.create({ email: 'admin@epop.local', passwordHash: await argon2.hash('admin123'), displayName: 'Admin', orgUnit: root as any, isAdmin: true }))
  const alice = await users.save(users.create({ email: 'alice@epop.local', passwordHash: await argon2.hash('alice123'), displayName: 'Alice', orgUnit: root as any }))
  const bob = await users.save(users.create({ email: 'bob@epop.local', passwordHash: await argon2.hash('bob123'), displayName: 'Bob', orgUnit: root as any }))

  // Project
  const proj = await projects.save(projects.create({ name: 'EPOP Launch', description: 'Initial project', owner: admin as any }))
  await members.save(members.create({ projectId: proj.id, userId: admin.id, role: 'owner' }))
  await members.save(members.create({ projectId: proj.id, userId: alice.id, role: 'member' }))
  const todo = await buckets.save(buckets.create({ project: proj as any, name: 'Todo', position: 1 }))
  const doing = await buckets.save(buckets.create({ project: proj as any, name: 'Doing', position: 2 }))
  await tasks.save(tasks.create({ project: proj as any, bucket: todo as any, title: 'Set up CI/CD', position: 1, createdBy: admin as any }))
  await tasks.save(tasks.create({ project: proj as any, bucket: todo as any, title: 'Define schemas', position: 2, createdBy: admin as any }))

  // Chat
  const chat = await chats.save(chats.create({ isGroup: true, title: 'General', createdBy: admin as any }))
  await parts.save(parts.create({ chatId: chat.id, userId: admin.id }))
  await parts.save(parts.create({ chatId: chat.id, userId: alice.id }))
  await parts.save(parts.create({ chatId: chat.id, userId: bob.id }))
  await messages.save(messages.create({ chat: chat as any, sender: admin as any, contentJson: { type: 'text', text: 'Welcome to EPOP!' } }))

  console.log('Seed completed.')
  await AppDataSource.destroy()
}

run().catch(async (e) => {
  console.error(e)
  try { await AppDataSource.destroy() } catch {}
  process.exit(1)
})
