import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { requestStatusEnum } from "./enums";
import { profiles } from "./auth";
import { services, serviceItems, serviceFormFields, serviceRequirements } from "./services";

import { ptspSchema } from "./schema";
export const serviceRequests = ptspSchema.table("ptsp_service_requests", {
  id: uuid("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  serviceId: bigint("service_id", { mode: "bigint" })
    .notNull()
    .references(() => services.id),
  serviceItemId: bigint("service_item_id", { mode: "bigint" })
    .notNull()
    .references(() => serviceItems.id),
  requestNumber: text("request_number").notNull().unique(),
  status: requestStatusEnum("status").notNull().default("draft"),
  submittedAt: timestamp("submitted_at", { withTimezone: true, precision: 6 }),
  approvedAt: timestamp("approved_at", { withTimezone: true, precision: 6 }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true, precision: 6 }),
  completedAt: timestamp("completed_at", { withTimezone: true, precision: 6 }),
  revisionNote: text("revision_note"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const serviceRequestAnswers = ptspSchema.table("ptsp_service_request_answers", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "service_request_answers_id_seq" }),
  requestId: uuid("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  fieldId: bigint("field_id", { mode: "bigint" }).references(
    () => serviceFormFields.id,
  ),
  fieldName: text("field_name").notNull(),
  fieldValue: text("field_value"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const serviceRequestDocuments = ptspSchema.table(
  "ptsp_service_request_documents",
  {
    id: bigint("id", { mode: "bigint" })
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: "service_request_documents_id_seq",
      }),
    requestId: uuid("request_id")
      .notNull()
      .references(() => serviceRequests.id, { onDelete: "cascade" }),
    requirementId: bigint("requirement_id", { mode: "bigint" }).references(
      () => serviceRequirements.id,
    ),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileType: text("file_type"),
    fileSize: bigint("file_size", { mode: "bigint" }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    requestRequirementIdx: uniqueIndex(
      "ptsp_service_request_documents_request_id_requirement_id_key",
    ).on(table.requestId, table.requirementId),
  }),
).enableRLS();

export const serviceRequestReviews = ptspSchema.table("ptsp_service_request_reviews", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "service_request_reviews_id_seq" }),
  requestId: uuid("request_id")
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  status: requestStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();

export const generatedDocuments = ptspSchema.table("ptsp_generated_documents", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "generated_documents_id_seq" }),
  requestId: uuid("request_id")
    .notNull()
    .unique()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  generatedBy: uuid("generated_by").references(() => profiles.id),
  generatedAt: timestamp("generated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
}).enableRLS();
