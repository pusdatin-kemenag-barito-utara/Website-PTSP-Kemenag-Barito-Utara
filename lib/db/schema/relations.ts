import { relations } from "drizzle-orm";
import { users, profiles, profilesPegawai } from "./auth";
import { services, serviceItems, serviceRequirements, serviceFormFields } from "./services";
import { serviceRequests, serviceRequestAnswers, serviceRequestDocuments, serviceRequestReviews, generatedDocuments } from "./requests";
import { activityLogs } from "./logs";
import { dataCutiPegawai, rekapCutiTahunan, pengajuanCuti, laporanKinerja, laporanKinerjaBulanan, usulPensiun } from "./kepegawaian";

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
  serviceRequests: many(serviceRequests),
  serviceRequestReviews: many(serviceRequestReviews),
  activityLogs: many(activityLogs),
  generatedDocuments: many(generatedDocuments),
  pegawai: one(profilesPegawai, {
    fields: [profiles.id],
    references: [profilesPegawai.profileId],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  serviceItems: many(serviceItems),
  serviceRequests: many(serviceRequests),
}));

export const serviceItemsRelations = relations(
  serviceItems,
  ({ one, many }) => ({
    service: one(services, {
      fields: [serviceItems.serviceId],
      references: [services.id],
    }),
    serviceRequirements: many(serviceRequirements),
    serviceFormFields: many(serviceFormFields),
    serviceRequests: many(serviceRequests),
  }),
);

export const serviceRequestsRelations = relations(
  serviceRequests,
  ({ one, many }) => ({
    profiles: one(profiles, {
      fields: [serviceRequests.userId],
      references: [profiles.id],
    }),
    services: one(services, {
      fields: [serviceRequests.serviceId],
      references: [services.id],
    }),
    serviceItems: one(serviceItems, {
      fields: [serviceRequests.serviceItemId],
      references: [serviceItems.id],
    }),
    serviceRequestAnswers: many(serviceRequestAnswers),
    serviceRequestDocuments: many(serviceRequestDocuments),
    serviceRequestReviews: many(serviceRequestReviews),
    activityLogs: many(activityLogs),
    generatedDocuments: many(generatedDocuments),
    pengajuanCuti: one(pengajuanCuti, {
      fields: [serviceRequests.id],
      references: [pengajuanCuti.requestId],
    }),
  }),
);

export const serviceFormFieldsRelations = relations(
  serviceFormFields,
  ({ one }) => ({
    serviceItem: one(serviceItems, {
      fields: [serviceFormFields.serviceItemId],
      references: [serviceItems.id],
    }),
  }),
);

export const serviceRequestAnswersRelations = relations(
  serviceRequestAnswers,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [serviceRequestAnswers.requestId],
      references: [serviceRequests.id],
    }),
    field: one(serviceFormFields, {
      fields: [serviceRequestAnswers.fieldId],
      references: [serviceFormFields.id],
    }),
  }),
);

export const serviceRequirementsRelations = relations(
  serviceRequirements,
  ({ one, many }) => ({
    serviceItem: one(serviceItems, {
      fields: [serviceRequirements.serviceItemId],
      references: [serviceItems.id],
    }),
    serviceRequestDocuments: many(serviceRequestDocuments),
  }),
);

export const serviceRequestDocumentsRelations = relations(
  serviceRequestDocuments,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [serviceRequestDocuments.requestId],
      references: [serviceRequests.id],
    }),
    serviceRequirements: one(serviceRequirements, {
      fields: [serviceRequestDocuments.requirementId],
      references: [serviceRequirements.id],
    }),
  }),
);


export const generatedDocumentsRelations = relations(
  generatedDocuments,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [generatedDocuments.requestId],
      references: [serviceRequests.id],
    }),
    generator: one(profiles, {
      fields: [generatedDocuments.generatedBy],
      references: [profiles.id],
    }),
  }),
);

export const serviceRequestReviewsRelations = relations(
  serviceRequestReviews,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [serviceRequestReviews.requestId],
      references: [serviceRequests.id],
    }),
    profiles: one(profiles, {
      fields: [serviceRequestReviews.reviewerId],
      references: [profiles.id],
    }),
  }),
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  request: one(serviceRequests, {
    fields: [activityLogs.requestId],
    references: [serviceRequests.id],
  }),
  profiles: one(profiles, {
    fields: [activityLogs.actorId],
    references: [profiles.id],
  }),
}));

export const dataCutiPegawaiRelations = relations(dataCutiPegawai, ({ many }) => ({
  rekapCutiTahunan: many(rekapCutiTahunan),
}));

export const rekapCutiTahunanRelations = relations(rekapCutiTahunan, ({ one }) => ({
  pegawai: one(dataCutiPegawai, {
    fields: [rekapCutiTahunan.pegawaiId],
    references: [dataCutiPegawai.id],
  }),
}));

export const pengajuanCutiRelations = relations(pengajuanCuti, ({ one }) => ({
  profiles: one(profiles, {
    fields: [pengajuanCuti.userId],
    references: [profiles.id],
  }),
  request: one(serviceRequests, {
    fields: [pengajuanCuti.requestId],
    references: [serviceRequests.id],
  }),
}));

export const laporanKinerjaRelations = relations(laporanKinerja, ({ one }) => ({
  profiles: one(profiles, {
    fields: [laporanKinerja.userId],
    references: [profiles.id],
  }),
}));

export const laporanKinerjaBulananRelations = relations(laporanKinerjaBulanan, ({ one }) => ({
  profiles: one(profiles, {
    fields: [laporanKinerjaBulanan.userId],
    references: [profiles.id],
  }),
  pejabatPemberiNilai: one(users, {
    fields: [laporanKinerjaBulanan.pejabatPenilaiId],
    references: [users.id],
  }),
}));

export const usulPensiunRelations = relations(
  usulPensiun,
  ({ one }) => ({
    request: one(serviceRequests, {
      fields: [usulPensiun.requestId],
      references: [serviceRequests.id],
    }),
    user: one(users, {
      fields: [usulPensiun.userId],
      references: [users.id],
    }),
  }),
);

export const profilesPegawaiRelations = relations(profilesPegawai, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilesPegawai.profileId],
    references: [profiles.id],
  }),
}));
