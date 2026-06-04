import {
  pgTable,
  text,
  timestamp,
  boolean,
  bigint,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const services = pgTable("ptsp_services", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "services_id_seq" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  roleOwner: text("role_owner"),
  sortOrder: integer("sort_order").default(0),
});

export const serviceItems = pgTable("ptsp_service_items", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "service_items_id_seq" }),
  serviceId: bigint("service_id", { mode: "bigint" })
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  sortOrder: integer("sort_order").default(0),
  estimatedTime: text("estimated_time").default("1-3 Hari Kerja"),
});

export const serviceRequirements = pgTable("ptsp_service_requirements", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "service_requirements_id_seq" }),
  serviceItemId: bigint("service_item_id", { mode: "bigint" })
    .notNull()
    .references(() => serviceItems.id, { onDelete: "cascade" }),
  documentName: text("document_name").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").notNull().default(true),
  allowedExtensions: text("allowed_extensions").default("pdf,jpg,jpeg,png"),
  maxFileSizeMb: integer("max_file_size_mb").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
});

export const serviceFormFields = pgTable("ptsp_service_form_fields", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "service_form_fields_id_seq" }),
  serviceItemId: bigint("service_item_id", { mode: "bigint" })
    .notNull()
    .references(() => serviceItems.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  placeholder: text("placeholder"),
  isRequired: boolean("is_required").notNull().default(false),
  options: text("options"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
    .notNull()
    .defaultNow(),
});
