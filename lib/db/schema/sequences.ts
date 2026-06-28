import {
  text,
  integer,
  uniqueIndex,
  primaryKey,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";
import { ptspSchema } from "./schema";

export const requestNumberSequences = ptspSchema.table("ptsp_request_number_sequences", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "request_number_sequences_id_seq" }),
  serviceCode: text("service_code").notNull(),
  year: integer("year").notNull(),
  lastSeq: integer("last_seq").notNull().default(0),
}, (table) => ({
  uniqueSeq: uniqueIndex("ptsp_request_number_sequences_service_code_year_key").on(table.serviceCode, table.year)
})).enableRLS();

export const recycledNumbers = ptspSchema.table("ptsp_recycled_numbers", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "recycled_numbers_id_seq" }),
  serviceCode: text("service_code").notNull(),
  year: integer("year").notNull(),
  seqNumber: integer("seq_number").notNull(),
  recycledAt: timestamp("recycled_at", { withTimezone: true, precision: 6 }).defaultNow(),
}, (table) => ({
  uniqueSeq: uniqueIndex("ptsp_recycled_numbers_service_code_year_seq_number_key").on(table.serviceCode, table.year, table.seqNumber)
})).enableRLS();
