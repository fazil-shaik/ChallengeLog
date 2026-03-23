import { pgTable, text, integer, boolean,
timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';




// ── ENUMS ───────────────────────────────────────
export const projectStatusEnum = pgEnum('project_status',
['active', 'completed', 'on_hold']);
export const requestSourceEnum = pgEnum('request_source',
['whatsapp','email','call','in_person','other']);
export const orderStatusEnum = pgEnum('order_status',
['draft','pending','approved','declined','billed']);
export const planEnum = pgEnum('plan', ['free','pro','studio']);



// ── USERS ───────────────────────────────────────
export const users = pgTable('users', {
id: text('id').primaryKey().$defaultFn(createId),
clerkId: text('clerk_id').notNull().unique(),
email: text('email').notNull().unique(),
name: text('name').notNull(),
hourlyRate: decimal('hourly_rate', {p:10,s:2}).default('0'),
logoUrl: text('logo_url'), // ImageKit CDN URL
logoFileId: text('logo_file_id'), // ImageKit fileId
plan: planEnum('plan').default('free'),
createdAt: timestamp('created_at').defaultNow(),
});




// ── PROJECTS ─────────────────────────────────────
export const projects = pgTable('projects', {
id: text('id').primaryKey().$defaultFn(createId),
userId: text('user_id').notNull()
.references(() => users.id, {onDelete:'cascade'}),
clientName: text('client_name').notNull(),
clientEmail: text('client_email').notNull(),
briefText: text('brief_text'), // pasted contract
briefFileUrl: text('brief_file_url'),// ImageKit PDF URL
briefFileId: text('brief_file_id'), // ImageKit fileId
originalValue: decimal('original_value',{p:10,s:2}),
status: projectStatusEnum('status').default('active'),
createdAt: timestamp('created_at').defaultNow(),
updatedAt: timestamp('updated_at').defaultNow(),
});




// ── CHANGE REQUESTS ─────────────────────────────
export const changeRequests = pgTable('change_requests', {
id: text('id').primaryKey().$defaultFn(createId),
projectId: text('project_id').notNull()
.references(() => projects.id, {onDelete:'cascade'}),
description: text('description').notNull(),
source: requestSourceEnum('source').default('email'),
aiHours: decimal('ai_hours',{p:6,s:2}),
aiCost: decimal('ai_cost',{p:10,s:2}),
aiInScope: boolean('ai_in_scope'),
aiReasoning: text('ai_reasoning'),
status: orderStatusEnum('status').default('draft'),
createdAt: timestamp('created_at').defaultNow(),
});




// ── CHANGE ORDERS ────────────────────────────────
export const changeOrders = pgTable('change_orders', {
id: text('id').primaryKey().$defaultFn(createId),
changeRequestId: text('change_request_id').notNull()
.references(() => changeRequests.id),
hours: decimal('hours',{p:6,s:2}).notNull(),
cost: decimal('cost',{p:10,s:2}).notNull(),
designerNotes: text('designer_notes'),
approvalToken: text('approval_token').unique(),//UUID
approvedAt: timestamp('approved_at'),
approvedIp: text('approved_ip'),
approvedByName: text('approved_by_name'),
pdfUrl: text('pdf_url'), // ImageKit PDF URL
pdfFileId: text('pdf_file_id'), // ImageKit fileId
status: orderStatusEnum('status').default('draft'),
createdAt: timestamp('created_at').defaultNow(),
});




// ── AUDIT EVENTS ─────────────────────────────────
export const auditEvents = pgTable('audit_events', {
id: text('id').primaryKey().$defaultFn(createId),
projectId: text('project_id').references(() => projects.id),
eventType: text('event_type').notNull(),
actor: text('actor'), // 'designer' | 'client'
payload: text('payload'), // JSON string
createdAt: timestamp('created_at').defaultNow(),
});


// ── SUBSCRIPTIONS ────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
id: text('id').primaryKey().$defaultFn(createId),
userId: text('user_id').notNull()
.references(() => users.id, {onDelete:'cascade'}),
stripeCustomerId: text('stripe_customer_id').unique(),
stripeSubId: text('stripe_sub_id').unique(),
plan: planEnum('plan').default('free'),
status: text('status').default('active'),
currentPeriodEnd: timestamp('current_period_end'),
createdAt: timestamp('created_at').defaultNow(),
});