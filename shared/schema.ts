import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const UserStatus = ["ACTIVE", "CREATED", "CONFIRMED"] as const;
export const UserRole = ["USER", "ADMIN", "SUPPORT"] as const;

export const users = pgTable("users", {
  email: text("email").notNull().primaryKey(),
  password: text("password").notNull(),
  status: text("status").notNull().default("CREATED"),
  role: text("role").default("USER"),
  email_confirm_token: text("email_confirm_token").notNull(),
  partner_id: integer("partner_id").notNull(),
  client_id: integer("client_id").notNull(),
  last_logon_time: timestamp("last_logon_time"),
});

export const insertUserSchema = createInsertSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const userResponseSchema = z.object({
  email: z.string().email(),
  status: z.enum(UserStatus),
  role: z.enum(UserRole),
  email_confirm_token: z.string(),
  partner_id: z.number(),
  client_id: z.number(),
  last_logon_time: z.date().optional(),
});

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  status: z.enum(UserStatus).optional(),
  role: z.enum(UserRole).optional(),
  email_confirm_token: z.string().optional(),
  partner_id: z.number().optional(),
  client_id: z.number().optional(),
  last_logon_time: z.date().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Partner schema
export const partners = pgTable("partners", {
  partner_id: serial("partner_id").primaryKey(),
  partner_name: text("partner_name").notNull(),
  inn: text("inn").notNull(),
  kpp: text("kpp").notNull(),
  ogrn: text("ogrn").notNull(),
  address: text("address").notNull(),
  email: text("email").notNull(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  partner_id: true,
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;

export const partnerResponseSchema = z.object({
  partner_id: z.number(),
  partner_name: z.string(),
  inn: z.string(),
  kpp: z.string(),
  ogrn: z.string(),
  address: z.string(),
  email: z.string().email(),
});

export const partnerUpdateSchema = z.object({
  partner_name: z.string().optional(),
  inn: z.string().optional(),
  kpp: z.string().optional(),
  ogrn: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional(),
});

export const partnerFormSchema = insertPartnerSchema.extend({
  partner_name: z.string().min(2, "Наименование партнера обязательно"),
  inn: z.string().min(1, "ИНН обязателен"),
  kpp: z.string().min(1, "КПП обязателен"),
  ogrn: z.string().min(1, "ОГРН обязателен"),
  address: z.string().min(5, "Адрес обязателен"),
  email: z.string().email("Необходим действительный адрес электронной почты"),
  apitoken: z.string().min(1, "API токен обязателен"),
});

export type PartnerResponse = z.infer<typeof partnerResponseSchema>;
export type PartnerUpdate = z.infer<typeof partnerUpdateSchema>;

// Client schema
export const clients = pgTable("clients", {
  client_id: serial("client_id").primaryKey(),
  partner_id: integer("partner_id").notNull(),
  client_name: text("client_name").notNull(),
  inn: text("inn").notNull(),
  type: text("type").notNull().default("COMPANY"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  client_id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export const clientResponseSchema = z.object({
  client_id: z.number(),
  partner_id: z.number(),
  client_name: z.string(),
  inn: z.string(),
  type: z.string(),
  createdAt: z.date().optional(),
});

export const clientFormSchema = insertClientSchema.extend({
  partner_id: z.number({required_error: "Выберите партнера"}),
  client_name: z.string().min(2, "Наименование клиента обязательно"),
  inn: z.string().min(10, "ИНН обязателен и должен содержать не менее 10 символов"),
  type: z.string({required_error: "Выберите тип клиента"}).default("COMPANY"),
});

export type ClientResponse = z.infer<typeof clientResponseSchema>;

// License schema
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull(),
  license_key: text("license_key").notNull().unique(),
  status: text("status").notNull().default("AVAIL"),
  issuedDate: timestamp("issued_date").defaultNow(),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  issuedDate: true,
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export const licenseResponseSchema = z.object({
  id: z.number(),
  client_id: z.number(),
  license_key: z.string(),
  status: z.string(),
  issuedDate: z.date().optional(),
});

export const licenseFormSchema = insertLicenseSchema.extend({
  client_id: z.number({required_error: "Выберите клиента"}),
  license_key: z.string().min(6, "Лицензионный ключ обязателен и должен содержать не менее 6 символов"),
  status: z.enum(["AVAIL", "USED", "BLOCKED"], {
    required_error: "Выберите статус лицензии",
  }).default("AVAIL"),
});

export const LicenseStatusOptions = [
  { label: "Доступна", value: "AVAIL" },
  { label: "Используется", value: "USED" },
  { label: "Заблокирована", value: "BLOCKED" },
];

export type LicenseResponse = z.infer<typeof licenseResponseSchema>;

// Device schema
export const devices = pgTable("devices", {
  device_id: serial("device_id").primaryKey(),
  client_id: integer("client_id").notNull(),
  license_id: integer("license_id").notNull(),
  inst_id: text("inst_id").notNull().unique(),
  os_version: text("os_version").notNull(),
  status: text("status").default("not_configured"),
  local_id: text("local_id").notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  device_id: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export const deviceResponseSchema = z.object({
  device_id: z.number(),
  client_id: z.number(),
  license_id: z.number(),
  inst_id: z.string(),
  os_version: z.string(),
  status: z.string(),
  local_id: z.string(),
});

export const deviceFormSchema = insertDeviceSchema.extend({
  client_id: z.number({required_error: "Выберите клиента"}),
  license_id: z.number({required_error: "Выберите лицензию"}),
  inst_id: z.string().min(4, "ID установки обязателен"),
  os_version: z.string().min(2, "Версия ОС обязательна"),
  local_id: z.string().min(4, "Локальный ID обязателен"),
  status: z.enum(["not_configured", "initialization", "ready", "sync_error"], {
    required_error: "Выберите статус устройства",
  }).default("not_configured"),
});

export const DeviceStatusOptions = [
  { label: "Не настроено", value: "not_configured" },
  { label: "Инициализация", value: "initialization" },
  { label: "Готово", value: "ready" },
  { label: "Ошибка синхронизации", value: "sync_error" },
];

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;

// Update schema
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  releaseDate: timestamp("release_date").defaultNow(),
  title: text("title").notNull(),
  description: text("description"),
  downloadUrl: text("download_url"),
  isRequired: boolean("is_required").default(false),
  releaseNotes: text("release_notes"),
  size: text("size"),
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true,
  releaseDate: true,
});

export type Update = typeof updates.$inferSelect;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;

export const updateResponseSchema = z.object({
  id: z.number(),
  version: z.string(),
  releaseDate: z.date().optional(),
  title: z.string(),
  description: z.string().optional(),
  downloadUrl: z.string().optional(),
  isRequired: z.boolean().optional(),
  releaseNotes: z.string().optional(),
  size: z.string().optional(),
});

export type UpdateResponse = z.infer<typeof updateResponseSchema>;
